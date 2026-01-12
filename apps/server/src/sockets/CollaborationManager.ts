import Redis from "ioredis";
import { CookiePayload, CustomWebSocket } from "../types/web-socket-types";
import DatabaseQueue from "../queue/DatabaseQueue";
import RedisCache from "../cache/redis.cache";
import { prisma } from "@nocturn/database";
import { CollaborationCookiePayload } from "@nocturn/types";

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

    constructor(dependencies: CollaborationManagerDependencies) {
        this.publisher = dependencies.publisher;
        this.subscriber = dependencies.subscriber;
        this.socket_mapping = dependencies.socket_mapping;
        this.session_collaborators_mapping = dependencies.session_collaborators_mapping;
        this.databaseQueue = dependencies.databaseQueue;
        this.redis_cache = dependencies.redis_cache;
    }

    public async handle_connection(ws: CustomWebSocket, decoded_cookie_payload: CollaborationCookiePayload) {

        // if the host is trying to join as a collaborator then return

        const is_valid_user = await this.validate_user_in_db(
            decoded_cookie_payload.userId,
        );

        if(!is_valid_user) {
            console.log('user validation failed, closing socket');
            ws.close();
            return;
        }



    }

    private async validate_user_in_db(user_id: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: {
                id: user_id,
            },
        });
        return !!user;
    }

}