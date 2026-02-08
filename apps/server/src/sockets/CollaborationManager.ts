import Redis from 'ioredis';
import { CustomWebSocket } from '../types/web-socket-types';
import DatabaseQueue from '../queue/DatabaseQueue';
import RedisCache from '../cache/redis.cache';
import { prisma } from '@nocturn/database';
import {
    COLLABORATORS_MESSAGE_TYPE,
    CookiePayload,
    PubSubMessageTypes,
    QuestionType,
    socket_codes,
} from '@nocturn/types';
import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import QuizManager from './QuizManager';
import CollaboratorsStateManager from './CollaboratorsStateManager';
import CollabStateCache from '../cache/collab_state.cache';
import { collabStateCacheInstance } from '../services/init.services';

export interface CollaborationManagerDependencies {
    publisher: Redis;
    subscriber: Redis;
    socket_mapping: Map<string, CustomWebSocket>;
    collaborator_sockets_mapping: Map<string, Set<string>>;
    databaseQueue: DatabaseQueue;
    quizManager: QuizManager;
    redis_cache: RedisCache;
    collaborators_state_manager: CollaboratorsStateManager;
}

export default class CollaborationManager {
    private publisher: Redis;
    private subscriber: Redis;

    private databaseQueue: DatabaseQueue;
    private redis_cache: RedisCache;
    private quizManager: QuizManager;

    private socket_mapping: Map<string, CustomWebSocket>;
    private collaborator_sockets_mapping: Map<string, Set<string>>;
    private collaborator_socket_mapping: Map<string, string> = new Map(); // Map<collaborator_id, socket_id>
    private collaborators_state_manager: CollaboratorsStateManager;
    private collaborator_quiz_state_cache: CollabStateCache = collabStateCacheInstance;

    constructor(dependencies: CollaborationManagerDependencies) {
        this.publisher = dependencies.publisher;
        this.subscriber = dependencies.subscriber;
        this.socket_mapping = dependencies.socket_mapping;
        this.databaseQueue = dependencies.databaseQueue;
        this.redis_cache = dependencies.redis_cache;
        this.quizManager = dependencies.quizManager;
        this.collaborator_sockets_mapping = dependencies.collaborator_sockets_mapping;
        this.collaborators_state_manager = dependencies.collaborators_state_manager;
    }

    public async handle_connection(ws: CustomWebSocket, decoded_cookie_payload: CookiePayload) {
        if (!decoded_cookie_payload.userId || !decoded_cookie_payload.collabSessionId) {
            ws.close(socket_codes.UNAUTHENTICATED, 'Invalid collaborator payload');
            return;
        }
        const is_valid_user = await this.validate_collaborator_in_db(decoded_cookie_payload.userId);

        if (!is_valid_user) {
            ws.close(socket_codes.UNAUTHENTICATED, 'User validation failed');
            return;
        }

        this.cleanup_existing_collaborator_socket(
            decoded_cookie_payload.userId,
            decoded_cookie_payload.collabSessionId,
        );

        const new_collaborator_socket_id = this.generateSocketId();
        ws.id = new_collaborator_socket_id;
        ws.user = decoded_cookie_payload;

        this.socket_mapping.set(new_collaborator_socket_id, ws);
        this.collaborator_socket_mapping.set(
            decoded_cookie_payload.userId,
            new_collaborator_socket_id,
        );

        const session_collaborators_socket_ids = this.collaborator_sockets_mapping.get(
            decoded_cookie_payload.collabSessionId,
        );
        if (!session_collaborators_socket_ids) {
            this.collaborator_sockets_mapping.set(
                decoded_cookie_payload.collabSessionId,
                new Set<string>(),
            );
        }

        this.collaborator_sockets_mapping
            .get(decoded_cookie_payload.collabSessionId)
            ?.add(new_collaborator_socket_id);
        this.setup_message_handlers(ws);
        this.collaborators_state_manager.on_collaborators_connect(
            decoded_cookie_payload.collabSessionId,
            decoded_cookie_payload.quizId,
        );
    }

    private setup_message_handlers(ws: CustomWebSocket) {
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handle_collaborator_message(ws, message);
            } catch (err) {
                console.error('Error parsing message', err);
            }
        });

        ws.on('close', () => {
            // this.handle_participant_leave_gamesession(ws);
            if (!ws.user.collabSessionId) {
                return;
            }
            this.cleanup_existing_collaborator_socket(ws.user.userId, ws.user.collabSessionId);
        });

        ws.on('error', () => {
            if (!ws.user.collabSessionId) {
                return;
            }
            this.cleanup_existing_collaborator_socket(ws.user.userId, ws.user.collabSessionId);
        });
    }

    private handle_collaborator_message(ws: CustomWebSocket, message: any) {
        switch (message.type) {
            case COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE:
                this.handle_question_tap(ws, message.payload);
                break;
            case COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE:
                this.handle_question_update(ws, message.payload);
                break;
            case COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE:
                this.handle_quiz_update(ws, message.payload);
                break;
            default:
                console.warn('Unknown message type received from collaborator:', message.type);
        }
    }

    private cleanup_existing_collaborator_socket(
        collaborator_id: string,
        collab_session_id: string,
    ): void {
        try {
            const exisiting_collaborator_socket_id =
                this.collaborator_socket_mapping.get(collaborator_id);

            if (!exisiting_collaborator_socket_id) {
                return;
            }

            const existing_socket = this.socket_mapping.get(exisiting_collaborator_socket_id);
            if (existing_socket && existing_socket.readyState === WebSocket.OPEN) {
                existing_socket.close(
                    socket_codes.DUPLICATE_CONNECTION,
                    'Another collaborator has connected',
                );
            }
            this.socket_mapping.delete(exisiting_collaborator_socket_id);
            this.collaborator_socket_mapping.delete(collaborator_id);

            const session_collaborators_socket_ids =
                this.collaborator_sockets_mapping.get(collab_session_id);
            if (session_collaborators_socket_ids) {
                session_collaborators_socket_ids.delete(exisiting_collaborator_socket_id);
            }
        } catch (error) {
            console.error('error while cleaning up collaborator socket: ', error);
            return;
        }
    }

    private async handle_question_tap(ws: CustomWebSocket, payload: any) {
        try {
            const { orderIndex } = payload;
            if (!ws.user.collabSessionId) {
                ws.close(socket_codes.UNAUTHENTICATED, 'Unauthenticated collaborator');
                return;
            }

            const data: PubSubMessageTypes = {
                type: COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE,
                payload: {
                    orderIndex,
                    collaboratorId: ws.user.userId,
                    collaboratorName: ws.user.name,
                },
                exclude_socket_id: ws.id,
            };
            await this.quizManager.publish_event_to_redis(ws.user.collabSessionId, data);
        } catch (err) {
            console.error('Error while handling question tap: ', err);
        }
    }

    private async handle_question_update(ws: CustomWebSocket, payload: any) {
        const {
            questionIndex,
            question,
        }: { questionIndex: number; question: Partial<QuestionType> } = payload;
        if (!ws.user.collabSessionId) {
            ws.close(socket_codes.UNAUTHENTICATED, 'Unauthenticated collaborator');
            return;
        }

        await this.collaborator_quiz_state_cache.update_question_state(
            ws.user.collabSessionId,
            ws.user.quizId,
            question,
        );
        const data: PubSubMessageTypes = {
            type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE,
            payload: {
                questionIndex,
                question,
                collaboratorId: ws.user.userId,
                collaboratorName: ws.user.name,
            },
            exclude_socket_id: ws.id,
        };
        await this.quizManager.publish_event_to_redis(ws.user.collabSessionId, data);
    }

    private handle_quiz_update(ws: CustomWebSocket, payload: any) {
        if (!ws.user.collabSessionId) {
            ws.close(socket_codes.UNAUTHENTICATED, 'Unauthenticated collaborator');
            return;
        }
        const data: PubSubMessageTypes = {
            type: COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE,
            payload: {
                quiz: payload,
                collaboratorId: ws.user.userId,
                collaboratorName: ws.user.name,
            },
            exclude_socket_id: ws.id,
        };
        this.quizManager.publish_event_to_redis(ws.user.collabSessionId, data);
    }

    private async validate_collaborator_in_db(user_id: string): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: user_id,
                },
            });
            return !!user;
        } catch (error) {
            console.error('error while validating collaborator in db: ', error);
            return false;
        }
    }

    private generateSocketId(): string {
        return uuid();
    }
}
