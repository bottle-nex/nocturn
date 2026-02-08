import { WebSocket } from 'ws';
import { COLLABORATORS_MESSAGE_TYPE, MESSAGE_TYPES, USER_TYPE } from '@nocturn/types';
import { CustomWebSocket } from '../types/web-socket-types';
import QuizSettings from '../class/quizSettings';
import Redis from 'ioredis';

interface SubscriberManagerProps {
    subscriber: Redis;
    socket_mapping: Map<string, CustomWebSocket>;
    session_participants_mapping: Map<string, Set<string>>;
    session_spectators_mapping: Map<string, Set<string>>;
    session_host_mapping: Map<string, string>;
    collaborator_sockets_mapping: Map<string, Set<string>>;
    quiz_settings: QuizSettings;
}

export default class SubscriberManager {
    private subscriber: Redis;
    private socket_mapping: Map<string, CustomWebSocket> = new Map(); // Map<ws.id, ws>
    private session_participants_mapping: Map<string, Set<string>> = new Map(); // Map<live_session_id<Set<ws.id>>
    private session_spectators_mapping: Map<string, Set<string>> = new Map(); // Map<live_session_id<Set<ws.id>>
    private session_host_mapping: Map<string, string> = new Map(); // Map<live_session_id, ws.id>
    private collaborator_sockets_mapping: Map<string, Set<string>> = new Map(); // Map<quiz_id, Set<ws.id>>;
    private quiz_settings: QuizSettings;

    constructor(config: SubscriberManagerProps) {
        this.subscriber = config.subscriber;
        this.socket_mapping = config.socket_mapping;
        this.session_participants_mapping = config.session_participants_mapping;
        this.session_spectators_mapping = config.session_spectators_mapping;
        this.session_host_mapping = config.session_host_mapping;
        this.collaborator_sockets_mapping = config.collaborator_sockets_mapping;
        this.quiz_settings = config.quiz_settings;
    }

    public listen_to_publishers() {
        this.subscriber.on('message', (channel: string, message: string) => {
            try {
                const parsed_subscriber_message = JSON.parse(message);
                this.handle_incoming_message_from_subscriber(channel, parsed_subscriber_message);
            } catch (err) {
                console.error('Error while handling redis message', err);
            }
        });
    }

    public handle_incoming_message_from_subscriber(channel: string, message: any) {
        const session_id = this.extract_session_id_from_channel(channel);
        if (!session_id) {
            console.error('Invalid game session id in channel', channel);
            return;
        }

        switch (message.type) {
            case MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;
            case MESSAGE_TYPES.SETTINGS_CHANGE:
                this.quiz_settings.update_memory_settings_state(session_id, message.payload);
                this.broadcast_to_session(
                    session_id,
                    message,
                    [USER_TYPE.PARTICIPANT, USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;
            case MESSAGE_TYPES.INTERACTION_EVENT:
                this.broadcast_to_session(
                    session_id,
                    message,
                    [USER_TYPE.PARTICIPANT, USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;
            case MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;
            case MESSAGE_TYPES.SPECTATOR_JOIN_GAME_SESSION:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;
            case MESSAGE_TYPES.SPECTATOR_NAME_CHANGE:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;
            case MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.SPECTATOR,
                ]);
                break;
            case MESSAGE_TYPES.CHAT_MESSAGE:
                this.broadcast_to_session(
                    session_id,
                    message,
                    [USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;
            case MESSAGE_TYPES.CHAT_REACTION_EVENT:
                this.broadcast_to_session(
                    session_id,
                    message,
                    [USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;
            case MESSAGE_TYPES.HOST_LAUNCH_QUESTION:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.PARTICIPANT,
                ]);
                break;
            case MESSAGE_TYPES.QUESTION_READING_PHASE_TO_HOST:
                this.broadcast_to_session(session_id, message, [USER_TYPE.HOST]);
                break;
            case MESSAGE_TYPES.QUESTION_READING_PHASE_TO_SPECTATOR:
                this.broadcast_to_session(session_id, message, [USER_TYPE.SPECTATOR]);
                break;
            case MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT:
                this.broadcast_to_session(session_id, message, [USER_TYPE.PARTICIPANT]);
                break;
            case MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_HOST:
                this.broadcast_to_session(session_id, message, [USER_TYPE.HOST]);
                break;
            case MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_SPECTATOR:
                this.broadcast_to_session(session_id, message, [USER_TYPE.SPECTATOR]);
                break;
            case MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_PARTICIPANT:
                this.broadcast_to_session(session_id, message, [USER_TYPE.PARTICIPANT]);
                break;
            case MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_HOST:
                this.broadcast_to_session(session_id, message, [USER_TYPE.HOST]);
                break;
            case MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_SPECTATOR:
                this.broadcast_to_session(session_id, message, [USER_TYPE.SPECTATOR]);
                break;
            case MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_PARTICIPANT:
                this.broadcast_to_session(session_id, message, [USER_TYPE.PARTICIPANT]);
                break;
            case MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE:
                this.broadcast_to_session(session_id, message, [USER_TYPE.HOST]);
                break;
            case MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE:
                this.broadcast_to_session(
                    session_id,
                    message,
                    [USER_TYPE.PARTICIPANT],
                    message.exclude_socket_id,
                    message.only_socket_id,
                );
                break;
            case MESSAGE_TYPES.QUESTION_ALREADY_ASKED:
                this.broadcast_to_session(
                    session_id,
                    message,
                    [USER_TYPE.HOST],
                    message.exclude_socket_id,
                    message.only_socket_id,
                );
                break;
            case MESSAGE_TYPES.HOST_EMITS_HINT:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.SPECTATOR,
                ]);
                break;
            case MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.PARTICIPANT,
                ]);
                break;
            case MESSAGE_TYPES.SPECTATOR_LEAVE_GAME_SESSION:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.PARTICIPANT,
                ]);
                break;
            case MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION:
                this.broadcast_to_session(session_id, message, [USER_TYPE.SPECTATOR]);
                break;
            case MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE:
                this.broadcast_to_session(
                    session_id,
                    message,
                    [USER_TYPE.PARTICIPANT],
                    undefined,
                    message.requestedParticipantId,
                );
                break;
            case MESSAGE_TYPES.LIFELINE_LIVE_UPDATE:
            case MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS:
                this.broadcast_to_session(session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.HOST,
                ]);
                break;
            case COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE:
                this.broadcast_to_collaborators(session_id, message, message.exclude_socket_id);
                break;
            case COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE:
                this.broadcast_to_collaborators(session_id, message, message.exclude_socket_id);
                break;
            case COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE:
                this.broadcast_to_collaborators(session_id, message, message.exclude_socket_id);
                break;
        }
    }

    private broadcast_to_collaborators(
        collab_session_id: string,
        message: any,
        exclude_socket_id?: string,
    ) {
        const collaborator_socket_ids = this.collaborator_sockets_mapping.get(collab_session_id);
        if (!collaborator_socket_ids) {
            return;
        }

        collaborator_socket_ids.forEach((socket_id) => {
            if (exclude_socket_id === socket_id) return;

            const collaborator_socket = this.socket_mapping.get(socket_id);
            if (collaborator_socket && collaborator_socket.readyState === WebSocket.OPEN) {
                collaborator_socket.send(JSON.stringify(message));
            }
        });
    }

    private broadcast_to_session(
        game_session_id: string,
        message: any,
        messages_to: USER_TYPE[],
        exclude_socket_id?: string,
        only_socket_id?: string,
    ) {
        if (messages_to.includes(USER_TYPE.HOST)) {
            const host_socket_id = this.session_host_mapping.get(game_session_id);
            if (!host_socket_id) {
                return;
            }

            if (host_socket_id && host_socket_id !== exclude_socket_id) {
                const host_socket = this.socket_mapping.get(host_socket_id);
                if (host_socket && host_socket.readyState === WebSocket.OPEN) {
                    host_socket.send(JSON.stringify(message));
                }
            }
        }

        if (messages_to.includes(USER_TYPE.PARTICIPANT)) {
            const participant_socket_ids = this.session_participants_mapping.get(game_session_id);

            if (only_socket_id) {
                const socket_id_exists = participant_socket_ids?.has(only_socket_id);
                if (socket_id_exists) {
                    const participant_socket = this.socket_mapping.get(only_socket_id);
                    if (participant_socket && participant_socket.readyState === WebSocket.OPEN) {
                        participant_socket.send(JSON.stringify(message));
                    }
                }
                return;
            }

            participant_socket_ids?.forEach((socket_id: string) => {
                if (exclude_socket_id === socket_id) {
                    return;
                }
                const participant_socket = this.socket_mapping.get(socket_id);
                if (participant_socket && participant_socket.readyState === WebSocket.OPEN) {
                    participant_socket.send(JSON.stringify(message));
                }
            });
        }

        if (messages_to.includes(USER_TYPE.SPECTATOR)) {
            const spectator_socket_ids = this.session_spectators_mapping.get(game_session_id);

            if (only_socket_id) {
                const socket_id_exists = spectator_socket_ids?.has(only_socket_id);
                if (socket_id_exists) {
                    const spectator_socket = this.socket_mapping.get(only_socket_id);
                    if (spectator_socket && spectator_socket.readyState === WebSocket.OPEN) {
                        spectator_socket.send(JSON.stringify(message));
                    }
                }
                return;
            }

            spectator_socket_ids?.forEach((socket_id: string) => {
                if (exclude_socket_id === socket_id) {
                    return;
                }
                const spectator_socket = this.socket_mapping.get(socket_id);
                if (spectator_socket && spectator_socket.readyState === WebSocket.OPEN) {
                    spectator_socket.send(JSON.stringify(message));
                }
            });
        }
    }

    private extract_session_id_from_channel(channel: string): string | null {
        const match = channel.match(/game_session:(.+)/);
        return match ? match[1] : null;
    }
}
