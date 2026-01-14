import Redis from 'ioredis';
import { CustomWebSocket } from '../types/web-socket-types';
import DatabaseQueue from '../queue/DatabaseQueue';
import RedisCache from '../cache/redis.cache';
import { prisma } from '@nocturn/database';
import { CookiePayload, socket_codes } from '@nocturn/types';
import WebSocket from 'ws';
import { v4 as uuid } from 'uuid';

export interface CollaborationManagerDependencies {
    publisher: Redis;
    subscriber: Redis;
    socket_mapping: Map<string, CustomWebSocket>;
    session_collaborators_mapping: Map<string, Set<string>>;
    databaseQueue: DatabaseQueue;
    redis_cache: RedisCache;
}

export default class CollaborationManager {
    private publisher: Redis;
    private subscriber: Redis;
    private socket_mapping: Map<string, CustomWebSocket>;
    private session_collaborators_mapping: Map<string, Set<string>>;
    private databaseQueue: DatabaseQueue;
    private redis_cache: RedisCache;

    private collaborator_socket_mapping: Map<string, string>; // Map<collaboratorId, socketId>

    constructor(dependencies: CollaborationManagerDependencies) {
        this.publisher = dependencies.publisher;
        this.subscriber = dependencies.subscriber;
        this.socket_mapping = dependencies.socket_mapping;
        this.session_collaborators_mapping = dependencies.session_collaborators_mapping;
        this.databaseQueue = dependencies.databaseQueue;
        this.redis_cache = dependencies.redis_cache;

        this.collaborator_socket_mapping = new Map<string, string>();
    }

    public async handle_connection(ws: CustomWebSocket, decoded_cookie_payload: CookiePayload) {
        // if the host is trying to join as a collaborator then return

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

        // setting up the data into the mappings
        this.socket_mapping.set(new_collaborator_socket_id, ws);
        this.collaborator_socket_mapping.set(
            decoded_cookie_payload.userId,
            new_collaborator_socket_id,
        );

        // check if the session-collaborator mapping exists
        const session_collaborators_socket_ids = this.session_collaborators_mapping.get(
            decoded_cookie_payload.gameSessionId,
        );
        if (!session_collaborators_socket_ids) {
            this.session_collaborators_mapping.set(
                decoded_cookie_payload.gameSessionId,
                new Set<string>(),
            );
        }

        this.session_collaborators_mapping
            .get(decoded_cookie_payload.gameSessionId)
            ?.add(new_collaborator_socket_id);
    }

    // private on_collaborator_connect(decoded_cookie_payload: CookiePayload) {
    //     try {
    //         const collaborator_id = decoded_cookie_payload.userId;
    //     } catch (error) {
    //         console.error('error on collaborator connect: ', error);
    //         return;
    //     }
    // }

    private cleanup_existing_collaborator_socket(
        collaborator_id: string,
        collab_session_id: string,
    ): void {
        try {
            const existing_collaborator_socket_id =
                this.collaborator_socket_mapping.get(collaborator_id);
            if (existing_collaborator_socket_id) {
                const existing_socket = this.socket_mapping.get(existing_collaborator_socket_id);
                if (existing_socket && existing_socket.readyState === WebSocket.OPEN) {
                    existing_socket.close(
                        socket_codes.DUPLICATE_CONNECTION,
                        'Another collaborator has connected',
                    );
                }
                this.socket_mapping.delete(existing_collaborator_socket_id);
                this.collaborator_socket_mapping.delete(collaborator_id);

                const session_collaborators_socket_ids =
                    this.session_collaborators_mapping.get(collab_session_id);
                if (session_collaborators_socket_ids) {
                    session_collaborators_socket_ids.delete(existing_collaborator_socket_id);
                }
            }
        } catch (error) {
            console.error('error while cleaning up collaborator socket: ', error);
            return;
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
