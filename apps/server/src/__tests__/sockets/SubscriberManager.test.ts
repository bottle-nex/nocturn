import { describe, expect, it, vi } from 'vitest';
import { WebSocket } from 'ws';
import Redis from 'ioredis';
import { MESSAGE_TYPES } from '@nocturn/types';
import QuizSettings from '../../class/quizSettings';
import SubscriberManager from '../../sockets/SubscriberManager';

vi.mock('ioredis');
vi.mock('../../class/quizSettings');
vi.mock('../../controllers/quiz-controller/quizController', () => ({ default: {} }));

function create_socket(id: string, readyState: WebSocket['readyState'] = WebSocket.OPEN) {
    const socket = Object.assign(new WebSocket(null, undefined, {}), { id });
    Object.defineProperty(socket, 'readyState', { value: readyState });
    vi.spyOn(socket, 'send').mockImplementation(() => {});
    return socket;
}

describe('SubscriberManager session broadcasts', () => {
    it.each(['unmapped', 'missing', 'closed', 'connected', 'excluded'])(
        'delivers to participants and spectators when the host is %s',
        (host_state) => {
            const host = create_socket(
                'host',
                host_state === 'closed' ? WebSocket.CLOSED : WebSocket.OPEN,
            );
            const participant = create_socket('participant');
            const spectator = create_socket('spectator');
            const socket_mapping = new Map([
                [participant.id, participant],
                [spectator.id, spectator],
            ]);
            if (host_state !== 'missing') {
                socket_mapping.set(host.id, host);
            }
            const manager = new SubscriberManager({
                subscriber: new Redis(),
                socket_mapping,
                session_host_mapping:
                    host_state === 'unmapped' ? new Map() : new Map([['session', host.id]]),
                session_participants_mapping: new Map([['session', new Set([participant.id])]]),
                session_spectators_mapping: new Map([['session', new Set([spectator.id])]]),
                collaborator_sockets_mapping: new Map(),
                quiz_settings: new QuizSettings(),
            });
            const message = {
                type: MESSAGE_TYPES.INTERACTION_EVENT,
                payload: { reaction: 'test' },
                exclude_socket_id: host_state === 'excluded' ? host.id : undefined,
            };

            manager.handle_incoming_message_from_subscriber('game_session:session', message);

            for (const socket of [participant, spectator]) {
                expect(socket.send).toHaveBeenCalledExactlyOnceWith(JSON.stringify(message));
            }
            if (host_state === 'connected') {
                expect(host.send).toHaveBeenCalledExactlyOnceWith(JSON.stringify(message));
            } else {
                expect(host.send).not.toHaveBeenCalled();
            }
        },
    );
});
