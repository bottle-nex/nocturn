import Redis from 'ioredis';
import { CustomWebSocket } from '../types/web-socket-types';
import DatabaseQueue from '../queue/DatabaseQueue';
import RedisCache from '../cache/redis.cache';
import { prisma } from '@nocturn/database';
import {
    COLLABORATORS_MESSAGE_TYPE,
    CookiePayload,
    PubSubMessageTypes,
    socket_codes,
} from '@nocturn/types';
import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';
import QuizManager from './QuizManager';

export interface CollaborationManagerDependencies {
    publisher: Redis;
    subscriber: Redis;
    socket_mapping: Map<string, CustomWebSocket>;
    quiz_collaborators_mapping: Map<string, Set<string>>;
    databaseQueue: DatabaseQueue;
    quizManager: QuizManager;
    redis_cache: RedisCache;
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

    constructor(dependencies: CollaborationManagerDependencies) {
        this.publisher = dependencies.publisher;
        this.subscriber = dependencies.subscriber;
        this.socket_mapping = dependencies.socket_mapping;
        this.databaseQueue = dependencies.databaseQueue;
        this.redis_cache = dependencies.redis_cache;
        this.quizManager = dependencies.quizManager;
        this.collaborator_sockets_mapping = dependencies.quiz_collaborators_mapping;
    }

    public async handle_connection(ws: CustomWebSocket, decoded_cookie_payload: CookiePayload) {
        const is_valid_user = await this.validate_collaborator_in_db(decoded_cookie_payload.userId);

        if (!is_valid_user) {
            console.log('user validation failed, closing socket');
            ws.close();
            return;
        }

        this.cleanup_existing_collaborator_socket(
            decoded_cookie_payload.userId,
            decoded_cookie_payload.gameSessionId,
        );

        const new_collaborator_socket_id = this.generateSocketId();
        ws.id = new_collaborator_socket_id;
        ws.user = decoded_cookie_payload;

        this.socket_mapping.set(new_collaborator_socket_id, ws);
        this.collaborator_socket_mapping.set(
            decoded_cookie_payload.userId,
            new_collaborator_socket_id,
        );

        // check if the session-collaborator mapping exists
        const session_collaborators_socket_ids = this.collaborator_sockets_mapping.get(
            decoded_cookie_payload.gameSessionId,
        );
        if (!session_collaborators_socket_ids) {
            this.collaborator_sockets_mapping.set(
                decoded_cookie_payload.gameSessionId,
                new Set<string>(),
            );
        }

        this.collaborator_sockets_mapping
            .get(decoded_cookie_payload.gameSessionId)
            ?.add(new_collaborator_socket_id);
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

    private async handle_question_tap(ws: CustomWebSocket, questionId: string) {
        try {
            if (!ws.user.collabSessionId) {
                ws.close(socket_codes.UNAUTHENTICATED, 'Unauthenticated collaborator');
                return;
            }
            const data: PubSubMessageTypes = {
                type: COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE,
                payload: {
                    questionId: questionId,
                },
            };
            await this.quizManager.publish_event_to_redis(ws.user.collabSessionId, data);
        } catch (err) {
            console.error('Error while handling question tap: ', err);
        }
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
