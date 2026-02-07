import { WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'http';
import Redis from 'ioredis';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { URL } from 'url';
import HostManager from './HostManager';
import QuizManager from './QuizManager';
import RedisCache from '../cache/redis.cache';
import ParticipantManager from './ParticipantManager';
import SpectatorManager from './SpectatorManager';
import CollaborationManager from './CollaborationManager';
import SubscriberManager from './SubscriberManager';
import DatabaseQueue from '../queue/DatabaseQueue';
import PhaseQueue from '../queue/PhaseQueue';
import QuizSettings from '../class/quizSettings';
import { CookiePayload, NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
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
import { env } from '../configs/env';
import CollaboratorsStateManager from './CollaboratorsStateManager';

export default class WebsocketServer {
    private wss: WebSocketServer;
    private socket_mapping: Map<string, CustomWebSocket> = new Map(); // Map<ws.id, ws>
    private session_participants_mapping: Map<string, Set<string>> = new Map(); // Map<live_session_id<Set<ws.id>>
    private session_spectators_mapping: Map<string, Set<string>> = new Map(); // Map<live_session_id<Set<ws.id>>
    private session_host_mapping: Map<string, string> = new Map(); // Map<live_session_id, ws.id>
    private collaborator_sockets_mapping: Map<string, Set<string>> = new Map(); // Map<quiz_id, Set<ws.id>>;

    private publisher: Redis;
    private subscriber: Redis;

    private redis_cache: RedisCache;
    private database_queue: DatabaseQueue;
    private phase_queue: PhaseQueue;
    private quiz_settings: QuizSettings;

    private hostManager!: HostManager;
    private quizManager!: QuizManager;
    private participant_manager!: ParticipantManager;
    private spectator_manager!: SpectatorManager;
    private collaboration_manager!: CollaborationManager;
    private collaborators_state_manager!: CollaboratorsStateManager;
    private subscriber_manager!: SubscriberManager;

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });
        this.publisher = publisherInstance;
        this.subscriber = subscriberInstance;
        this.redis_cache = redisCacheInstance;
        this.database_queue = databaseQueueInstance;
        this.phase_queue = phaseQueueInstance;
        this.quiz_settings = quizSettingInstance;
        this.initialize_subscriber_manager();
        this.initialize_managers();
        this.initialize();
    }

    private initialize_subscriber_manager() {
        this.subscriber_manager = new SubscriberManager({
            subscriber: this.subscriber,
            socket_mapping: this.socket_mapping,
            session_participants_mapping: this.session_participants_mapping,
            session_spectators_mapping: this.session_spectators_mapping,
            session_host_mapping: this.session_host_mapping,
            collaborator_sockets_mapping: this.collaborator_sockets_mapping,
            quiz_settings: this.quiz_settings,
        });
        this.subscriber_manager.listen_to_publishers();
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
        this.collaborators_state_manager = new CollaboratorsStateManager({
            redis_cache: this.redis_cache,
        });
        this.collaboration_manager = new CollaborationManager({
            publisher: this.publisher,
            subscriber: this.subscriber,
            socket_mapping: this.socket_mapping,
            collaborator_sockets_mapping: this.collaborator_sockets_mapping,
            databaseQueue: this.database_queue,
            redis_cache: this.redis_cache,
            quizManager: this.quizManager,
            collaborators_state_manager: this.collaborators_state_manager,
        });
    }

    private initialize() {
        this.wss.on('connection', (ws: CustomWebSocket, req) => {
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
                const redis_key: string = `game_session:${decoded_cookie_payload.gameSessionId || decoded_cookie_payload.collabSessionId}`;
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
                                decoded_cookie_payload,
                            );
                            break;
                        case USER_TYPE.SPECTATOR:
                            await this.spectator_manager.handle_connection(
                                ws,
                                decoded_cookie_payload,
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
