import { EventEmitter } from 'events';
import { describe, expect, it, vi } from 'vitest';
import { prisma } from '@nocturn/database';
import CollaborationManager from '../../sockets/CollaborationManager';
import SubscriberManager from '../../sockets/SubscriberManager';
import { COLLABORATORS_MESSAGE_TYPE } from '@nocturn/types';

describe('CollaborationManager connections', () => {
    it('keeps another tab connected when a tab closes', async () => {
        vi.mocked(prisma.collabSession.findFirst).mockResolvedValue({ id: 'session' } as any);
        const sockets = new Map();
        const sessions = new Map();
        const manager = new CollaborationManager({
            socket_mapping: sockets,
            collaborator_sockets_mapping: sessions,
            collaborators_state_manager: { on_collaborators_connect: vi.fn() },
        } as any);
        const first = Object.assign(new EventEmitter(), { close: vi.fn() });
        const second = Object.assign(new EventEmitter(), { close: vi.fn() });
        const payload = { userId: 'user', collabSessionId: 'session', quizId: 'quiz' } as any;

        await manager.handle_connection(first as any, payload);
        await manager.handle_connection(second as any, payload);

        expect(first.close).not.toHaveBeenCalled();
        expect(sockets.size).toBe(2);
        expect(sessions.get('session').size).toBe(2);

        first.emit('close');
        expect(sockets.size).toBe(1);
        expect(sessions.get('session').size).toBe(1);
        expect([...sockets.values()]).toEqual([second]);
    });

    it('rejects reconnects and messages after membership is removed', async () => {
        const membership = vi.mocked(prisma.collabSession.findFirst);
        membership.mockResolvedValueOnce({ id: 'session' } as any).mockResolvedValue(null);
        const manager = new CollaborationManager({
            socket_mapping: new Map(),
            collaborator_sockets_mapping: new Map(),
            collaborators_state_manager: { on_collaborators_connect: vi.fn() },
            quizManager: { publish_collab_event_to_redis: vi.fn() },
        } as any);
        const first = Object.assign(new EventEmitter(), { close: vi.fn() });
        const second = Object.assign(new EventEmitter(), { close: vi.fn() });
        const payload = { userId: 'user', collabSessionId: 'session', quizId: 'quiz' } as any;

        await manager.handle_connection(first as any, payload);
        await manager.handle_connection(second as any, payload);
        expect(second.close).toHaveBeenCalled();
        first.emit('message', Buffer.from('{}'));
        await vi.waitFor(() => expect(first.close).toHaveBeenCalled());
        expect(membership).toHaveBeenCalledWith({
            where: {
                id: 'session',
                quizId: 'quiz',
                OR: [
                    { hostId: 'user' },
                    { collaborators: { some: { userId: 'user', isBlocked: false } } },
                ],
            },
            select: { id: true },
        });
    });

    it('does not deliver collaboration events to a removed member', async () => {
        vi.mocked(prisma.collabSession.findFirst).mockResolvedValue(null);
        const socket = {
            readyState: 1,
            collabUser: { userId: 'user', collabSessionId: 'session', quizId: 'quiz' },
            close: vi.fn(),
            send: vi.fn(),
        };
        const manager = new SubscriberManager({
            socket_mapping: new Map([['socket', socket]]),
            collaborator_sockets_mapping: new Map([['session', new Set(['socket'])]]),
        } as any);
        manager.handle_incoming_message_from_subscriber('collab_session:session', {
            type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE,
            payload: {},
        });
        await vi.waitFor(() => expect(socket.close).toHaveBeenCalled());
        expect(socket.send).not.toHaveBeenCalled();
    });

    it('delivers collaboration events in order while membership checks are pending', async () => {
        let resolveFirst: (value: any) => void = () => {};
        const membership = vi.mocked(prisma.collabSession.findFirst);
        membership.mockReset();
        membership.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveFirst = resolve;
            }) as any,
        );
        membership.mockResolvedValue({ id: 'session' } as any);
        const socket = {
            readyState: 1,
            collabUser: { userId: 'user', collabSessionId: 'session', quizId: 'quiz' },
            close: vi.fn(),
            send: vi.fn(),
        };
        const manager = new SubscriberManager({
            socket_mapping: new Map([['socket', socket]]),
            collaborator_sockets_mapping: new Map([['session', new Set(['socket'])]]),
        } as any);
        const first = { type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE, payload: { value: 1 } };
        const second = { type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE, payload: { value: 2 } };
        manager.handle_incoming_message_from_subscriber('collab_session:session', first);
        manager.handle_incoming_message_from_subscriber('collab_session:session', second);
        await vi.waitFor(() => expect(membership).toHaveBeenCalledTimes(1));
        resolveFirst({ id: 'session' });
        await vi.waitFor(() => expect(socket.send).toHaveBeenCalledTimes(2));
        expect(socket.send.mock.calls).toEqual([[JSON.stringify(first)], [JSON.stringify(second)]]);
    });
});
