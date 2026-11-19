import { beforeEach, describe, expect, it, vi } from 'vitest';
import Redis from 'ioredis';
import { WebSocket } from 'ws';
import { COLLABORATORS_MESSAGE_TYPE, CollabRole, socket_codes } from '@nocturn/types';
import type { CollabSessionTokenPayload } from '@nocturn/types';
import CollaborationManager from '../../sockets/CollaborationManager';
import CollaboratorsStateManager from '../../sockets/CollaboratorsStateManager';
import QuizManager from '../../sockets/QuizManager';
import SubscriberManager from '../../sockets/SubscriberManager';
import RedisCache from '../../cache/redis.cache';
import DatabaseQueue from '../../queue/database/database.queue';
import QuizSettings from '../../class/quizSettings';
import type { CustomWebSocket } from '../../types/web-socket-types';

const mocks = vi.hoisted(() => ({ findSession: vi.fn() }));
vi.mock('@nocturn/database', () => ({
    prisma: { collabSession: { findFirst: mocks.findSession } },
}));
vi.mock('ws', async () => {
    const { EventEmitter } = await import('node:events');
    class Socket extends EventEmitter {
        static OPEN = 1;
    }
    return { default: Socket, WebSocket: Socket };
});
vi.mock('ioredis', () => ({ default: class {} }));
vi.mock('../../cache/redis.cache', () => ({ default: class {} }));
vi.mock('../../queue/database/database.queue', () => ({ default: class {} }));
vi.mock('../../class/quizSettings', () => ({ default: class {} }));

const payload: CollabSessionTokenPayload = {
    userId: 'member',
    quizId: 'quiz',
    collabSessionId: 'session',
    role: CollabRole.EDITOR,
    name: 'Member',
    color: '#ffffff',
    tokenId: 'token',
    iat: 1,
    exp: 9999999999,
};
class TestSocket extends WebSocket {
    id = '';
    collabUser = payload;
    close = vi.fn();
    send = vi.fn();
    constructor() {
        super(null);
        Object.defineProperty(this, 'readyState', { value: WebSocket.OPEN });
    }
}
function setup() {
    const redis = new Redis();
    const redis_cache = new RedisCache();
    const databaseQueue = new DatabaseQueue();
    const quizManager = new QuizManager({
        publisher: redis,
        subscriber: redis,
        redis_cache,
        database_queue: databaseQueue,
    });
    const publish = vi
        .spyOn(quizManager, 'publish_collab_event_to_redis')
        .mockResolvedValue(undefined);
    const state = new CollaboratorsStateManager({ redis_cache });
    vi.spyOn(state, 'on_collaborators_connect').mockResolvedValue(undefined);
    const sockets = new Map<string, CustomWebSocket>();
    const sessions = new Map<string, Set<string>>();
    const manager = new CollaborationManager({
        publisher: redis,
        subscriber: redis,
        socket_mapping: sockets,
        collaborator_sockets_mapping: sessions,
        databaseQueue,
        quizManager,
        redis_cache,
        collaborators_state_manager: state,
    });
    const subscriber = new SubscriberManager({
        subscriber: redis,
        socket_mapping: sockets,
        collaborator_sockets_mapping: sessions,
        session_participants_mapping: new Map(),
        session_spectators_mapping: new Map(),
        session_host_mapping: new Map(),
        quiz_settings: new QuizSettings(),
    });
    return { manager, subscriber, sockets, sessions, publish };
}

describe('collaboration sockets', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.findSession.mockResolvedValue({ id: 'session' });
    });

    it('keeps multiple tabs connected and cleans up only the closing socket', async () => {
        const { manager, sockets, sessions } = setup();
        const first = new TestSocket();
        const second = new TestSocket();
        await manager.handle_connection(first, payload);
        await manager.handle_connection(second, payload);
        expect(first.close).not.toHaveBeenCalled();
        expect(sessions.get('session')?.size).toBe(2);
        first.emit('close');
        expect(sockets.has(second.id)).toBe(true);
        expect(sessions.get('session')).toEqual(new Set([second.id]));
        second.emit('close');
        expect(sessions.has('session')).toBe(false);
    });

    it('binds authorization to the session, quiz, and current membership', async () => {
        const { manager } = setup();
        const ws = new TestSocket();
        mocks.findSession.mockResolvedValue(null);
        await manager.handle_connection(ws, payload);
        expect(mocks.findSession).toHaveBeenCalledWith({
            where: {
                id: 'session',
                quizId: 'quiz',
                quiz: { isDeleted: false, status: 'CREATED' },
                OR: [
                    { hostId: 'member' },
                    { collaborators: { some: { userId: 'member', isBlocked: false } } },
                ],
            },
            select: { id: true },
        });
        expect(ws.close).toHaveBeenCalledWith(
            socket_codes.UNAUTHENTICATED,
            'User validation failed',
        );
    });

    it('rechecks existing connections before accepting another edit', async () => {
        const { manager, publish } = setup();
        const ws = new TestSocket();
        await manager.handle_connection(ws, payload);
        mocks.findSession.mockResolvedValue(null);
        ws.emit(
            'message',
            Buffer.from(
                JSON.stringify({
                    type: COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE,
                    payload: { orderIndex: 2 },
                }),
            ),
        );
        await vi.waitFor(() =>
            expect(ws.close).toHaveBeenCalledWith(
                socket_codes.UNAUTHENTICATED,
                'Collaboration access revoked',
            ),
        );
        expect(publish).not.toHaveBeenCalled();
    });

    it('receives reconnect replay while the initial membership check is pending', async () => {
        const { manager, publish } = setup();
        const ws = new TestSocket();
        const connecting = manager.handle_connection(ws, payload);
        ws.emit(
            'message',
            Buffer.from(
                JSON.stringify({
                    type: COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE,
                    payload: { orderIndex: 2 },
                }),
            ),
        );
        await connecting;
        await vi.waitFor(() => expect(publish).toHaveBeenCalledOnce());
    });

    it('broadcasts an edit to all other tabs', async () => {
        const { manager, subscriber } = setup();
        const first = new TestSocket();
        const second = new TestSocket();
        await manager.handle_connection(first, payload);
        await manager.handle_connection(second, payload);
        const message = {
            type: COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE,
            payload: { quiz: { title: 'Changed' } },
            exclude_socket_id: first.id,
        };
        subscriber.handle_incoming_message_from_subscriber('collab_session:session', message);
        await vi.waitFor(() => expect(second.send).toHaveBeenCalledWith(JSON.stringify(message)));
        expect(first.send).not.toHaveBeenCalled();
    });

    it('preserves broadcast order while membership checks are pending', async () => {
        const { manager, subscriber } = setup();
        const ws = new TestSocket();
        await manager.handle_connection(ws, payload);
        mocks.findSession.mockClear();
        let release: () => void = () => {
            throw new Error('Membership check has not started');
        };
        const membership = new Promise<{ id: string }>((resolve) => {
            release = () => resolve({ id: 'session' });
        });
        mocks.findSession.mockReturnValueOnce(membership);
        const first = {
            type: COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE,
            payload: { quiz: { title: 'First' } },
        };
        const second = {
            type: COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE,
            payload: { quiz: { title: 'Second' } },
        };
        subscriber.handle_incoming_message_from_subscriber('collab_session:session', first);
        subscriber.handle_incoming_message_from_subscriber('collab_session:session', second);
        await vi.waitFor(() => expect(mocks.findSession).toHaveBeenCalledTimes(1));
        expect(ws.send).not.toHaveBeenCalled();
        release();
        await vi.waitFor(() => expect(ws.send).toHaveBeenCalledTimes(2));
        expect(ws.send.mock.calls).toEqual([[JSON.stringify(first)], [JSON.stringify(second)]]);
    });

    it('closes every removed user tab without closing other members', async () => {
        const { manager, subscriber } = setup();
        const first = new TestSocket();
        const second = new TestSocket();
        const other = new TestSocket();
        await manager.handle_connection(first, payload);
        await manager.handle_connection(second, payload);
        await manager.handle_connection(other, { ...payload, userId: 'other' });
        subscriber.handle_incoming_message_from_subscriber('collab_session:session', {
            type: COLLABORATORS_MESSAGE_TYPE.COLLABORATOR_REMOVED,
            payload: { userId: 'member' },
        });
        expect(first.close).toHaveBeenCalledWith(
            socket_codes.UNAUTHENTICATED,
            'Collaboration access revoked',
        );
        expect(second.close).toHaveBeenCalledOnce();
        expect(other.close).not.toHaveBeenCalled();
    });

    it('does not broadcast to a revoked connection even if it missed the removal event', async () => {
        const { manager, subscriber } = setup();
        const ws = new TestSocket();
        await manager.handle_connection(ws, payload);
        mocks.findSession.mockResolvedValue(null);
        subscriber.handle_incoming_message_from_subscriber('collab_session:session', {
            type: COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE,
            payload: { quiz: { title: 'private' } },
        });
        await vi.waitFor(() => expect(ws.close).toHaveBeenCalledOnce());
        expect(ws.send).not.toHaveBeenCalled();
    });
});
