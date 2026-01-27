import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'http';
import Redis from 'ioredis';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import HostManager from './HostManager';
import QuizManager from './QuizManager';
import RedisCache from '../cache/redis.cache';
import { URL } from 'url';
import ParticipantManager from './ParticipantManager';
import SpectatorManager from './SpectatorManager';
import { CookiePayload, MESSAGE_TYPES, NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import { CustomWebSocket } from '../types/web-socket-types';
import {
    databaseQueueInstance,
    phaseQueueInstance,
    publisherInstance,
    quizManagerInstance,
    quizSettingInstance,
    redisCacheInstance,
    subscriberInstance,
} from '../services/init.services';
import DatabaseQueue from '../queue/DatabaseQueue';
import PhaseQueue from '../queue/PhaseQueue';
import QuizSettings from '../class/quizSettings';
import { env } from '../configs/env';
import CollaborationManager from './CollaborationManager';

export default class WebsocketServer {
    private wss: WebSocketServer;
    private socket_mapping: Map<string, CustomWebSocket> = new Map(); // Map<ws.id, ws>
    private session_participants_mapping: Map<string, Set<string>> = new Map(); // Map<live_session_id<Set<ws.id>>
    private session_spectators_mapping: Map<string, Set<string>> = new Map(); // Map<live_session_id<Set<ws.id>>
    private session_host_mapping: Map<string, string> = new Map(); // Map<live_session_id, ws.id>
    private quiz_collaborators_mapping: Map<string, Set<string>> = new Map(); // Map<quiz_id, Set<ws.id>>
    private publisher: Redis;
    private subscriber: Redis;
    private redis_cache: RedisCache;
    private database_queue: DatabaseQueue;
    private phase_queue!: PhaseQueue;

    private hostManager!: HostManager;
    private quizManager!: QuizManager;
    private participant_manager!: ParticipantManager;
    private spectator_manager!: SpectatorManager;
    private collaboration_manager!: CollaborationManager;

    private quiz_settings: QuizSettings;

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });
        this.publisher = publisherInstance;
        this.subscriber = subscriberInstance;
        this.redis_cache = redisCacheInstance;
        this.database_queue = databaseQueueInstance;
        this.phase_queue = phaseQueueInstance;
        this.quiz_settings = quizSettingInstance;
        this.initialize_redis_subscribers();
        this.initialize_managers();
        this.initialize();
    }

    private initialize_redis_subscribers() {
        this.subscriber.on('message', (channel: string, message: string) => {
            try {
                const parsed_subscriber_message = JSON.parse(message);
                this.handle_incoming_message_from_subscriber(channel, parsed_subscriber_message);
            } catch (err) {
                console.error('Error while handling redis message', err);
            }
        });
    }

    private handle_incoming_message_from_subscriber(channel: string, message: any) {
        const game_session_id = this.extract_session_id_from_channel(channel);
        if (!game_session_id) {
            console.error('Invalid game session id in channel', channel);
            return;
        }

        switch (message.type) {
            case MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;

            case MESSAGE_TYPES.SETTINGS_CHANGE:
                this.quiz_settings.update_memory_settings_state(game_session_id, message.payload);
                console.log('new settings received are: ', message);
                this.broadcast_to_session(
                    game_session_id,
                    message,
                    [USER_TYPE.PARTICIPANT, USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;

            case MESSAGE_TYPES.INTERACTION_EVENT:
                this.broadcast_to_session(
                    game_session_id,
                    message,
                    [USER_TYPE.PARTICIPANT, USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;

            case MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;

            case MESSAGE_TYPES.SPECTATOR_JOIN_GAME_SESSION:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;

            case MESSAGE_TYPES.SPECTATOR_NAME_CHANGE:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                ]);
                break;

            case MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.SPECTATOR,
                ]);
                break;

            case MESSAGE_TYPES.CHAT_MESSAGE:
                this.broadcast_to_session(
                    game_session_id,
                    message,
                    [USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;

            case MESSAGE_TYPES.CHAT_REACTION_EVENT:
                this.broadcast_to_session(
                    game_session_id,
                    message,
                    [USER_TYPE.HOST, USER_TYPE.SPECTATOR],
                    message.exclude_socket_id,
                );
                break;

            case MESSAGE_TYPES.HOST_LAUNCH_QUESTION:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.PARTICIPANT,
                ]);
                break;

            case MESSAGE_TYPES.QUESTION_READING_PHASE_TO_HOST:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.HOST]);
                break;

            case MESSAGE_TYPES.QUESTION_READING_PHASE_TO_SPECTATOR:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.SPECTATOR]);
                break;

            case MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.PARTICIPANT]);
                break;

            case MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_HOST:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.HOST]);
                break;

            case MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_SPECTATOR:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.SPECTATOR]);
                break;

            case MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_PARTICIPANT:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.PARTICIPANT]);
                break;

            case MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_HOST:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.HOST]);
                break;

            case MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_SPECTATOR:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.SPECTATOR]);
                break;

            case MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_PARTICIPANT:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.PARTICIPANT]);
                break;

            case MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.HOST]);
                break;

            case MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE:
                this.broadcast_to_session(
                    game_session_id,
                    message,
                    [USER_TYPE.PARTICIPANT],
                    message.exclude_socket_id,
                    message.only_socket_id,
                );
                break;

            case MESSAGE_TYPES.QUESTION_ALREADY_ASKED:
                this.broadcast_to_session(
                    game_session_id,
                    message,
                    [USER_TYPE.HOST],
                    message.exclude_socket_id,
                    message.only_socket_id,
                );
                break;

            case MESSAGE_TYPES.HOST_EMITS_HINT:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.SPECTATOR,
                ]);
                break;

            case MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.PARTICIPANT, // No expiry - session ends when phase changes
                ]);
                break;

            case MESSAGE_TYPES.SPECTATOR_LEAVE_GAME_SESSION:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.HOST,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.PARTICIPANT,
                ]);
                break;

            case MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION:
                this.broadcast_to_session(game_session_id, message, [USER_TYPE.SPECTATOR]);
                break;

            case MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE:
                this.broadcast_to_session(
                    game_session_id,
                    message,
                    [USER_TYPE.PARTICIPANT],
                    undefined,
                    message.requestedParticipantId,
                );
                break;

            case MESSAGE_TYPES.LIFELINE_LIVE_UPDATE:
            case MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS:
                this.broadcast_to_session(game_session_id, message, [
                    USER_TYPE.PARTICIPANT,
                    USER_TYPE.SPECTATOR,
                    USER_TYPE.HOST,
                ]);
                break;
        }
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

    private initialize_managers() {
        this.quizManager = quizManagerInstance;
        this.hostManager = new HostManager({
            publisher: this.publisher,
            subscriber: this.subscriber,
            socketMapping: this.socket_mapping,
            sessionHostMapping: this.session_host_mapping,
            quizManager: this.quizManager,
            databaseQueue: this.database_queue,
            redis_cache: this.redis_cache,
            phase_queue: this.phase_queue,
        });
        this.participant_manager = new ParticipantManager({
            publisher: this.publisher,
            subscriber: this.subscriber,
            socket_mapping: this.socket_mapping,
            session_participants_mapping: this.session_participants_mapping,
            quizManager: this.quizManager,
            databaseQueue: this.database_queue,
            redis_cache: this.redis_cache,
            session_spectators_mapping: this.session_spectators_mapping,
        });
        this.spectator_manager = new SpectatorManager({
            publisher: this.publisher,
            subscriber: this.subscriber,
            socket_mapping: this.socket_mapping,
            session_spectator_mapping: this.session_spectators_mapping,
            session_participant_mapping: this.session_participants_mapping,
            participant_socket_mapping: this.participant_manager.get_participant_socket_mapping(),
            quizManager: this.quizManager,
            database_queue: this.database_queue,
            redis_cache: this.redis_cache,
        });
        this.collaboration_manager = new CollaborationManager({
            publisher: this.publisher,
            subscriber: this.subscriber,
            socket_mapping: this.socket_mapping,
            quiz_collaborators_mapping: this.quiz_collaborators_mapping,
            databaseQueue: this.database_queue,
            redis_cache: this.redis_cache,
        });
    }

    private initialize() {
        this.wss.on('connection', (ws: CustomWebSocket, req) => {
            console.log('new connection came');
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const quizId = url.searchParams.get('quizId');
            if (!quizId) {
                ws.close();
                return;
            }
            this.validate_connection(ws, req, quizId);
        });
    }

    private validate_connection(ws: CustomWebSocket, req: IncomingMessage, quizId: string): void {
        const cookies = req.headers.cookie;
        if (!cookies) {
            ws.close();
            return;
        }
        const parsedCookies = parse(cookies);
        const token = parsedCookies[NOCTURN_COOKIE_NAME];
        if (!token) {
            ws.close();
            return;
        }
        this.extract_token(ws, token, quizId);
    }

    private async extract_token(ws: CustomWebSocket, token: string, quizId: string): Promise<void> {
        try {
            jwt.verify(token, env.SERVER_JWT_SECRET, async (err, decoded) => {
                if (err) {
                    console.error('Error while verifying [JWT_SOCKET]', err);
                    ws.close();
                    return;
                }
                const decoded_cookie_payload: CookiePayload = decoded as CookiePayload;
                console.log('Decoded cookie payload:', decoded_cookie_payload);
                const redis_key: string = `game_session:${decoded_cookie_payload.gameSessionId}`;
                this.subscriber.subscribe(redis_key);
                if (decoded_cookie_payload.quizId !== quizId) {
                    console.error('Token validation failed');
                    ws.close();
                    return;
                }

                if (decoded_cookie_payload.role) {
                    switch (decoded_cookie_payload.role) {
                        case USER_TYPE.HOST:
                            await this.hostManager.handle_connection(ws, decoded_cookie_payload);
                            break;

                        case USER_TYPE.PARTICIPANT:
                            await this.participant_manager.handle_connection(
                                ws,
                                decoded_cookie_payload as CookiePayload,
                            );
                            break;

                        case USER_TYPE.SPECTATOR:
                            await this.spectator_manager.handle_connection(
                                ws,
                                decoded_cookie_payload as CookiePayload,
                            );
                            break;

                        default:
                    }
                } else if (decoded_cookie_payload.collabRole) {
                    await this.collaboration_manager.handle_connection(ws, decoded_cookie_payload);
                }
            });
        } catch (err) {
            console.error('Error while verifying [JWT_SOCKET]', err);
            ws.close();
        }
    }
}
