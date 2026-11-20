import Redis from 'ioredis';
import { PubSubMessageTypes } from '../types/types';
import { redisPublisherInstance } from '../services/init-services';

export default class Publisher {
    private publisher: Redis;
    constructor() {
        this.publisher = redisPublisherInstance;
    }

    public async publish_event_to_redis(game_session_id: string, event: PubSubMessageTypes) {
        const key = this.get_redis_key(game_session_id);
        await this.publisher.publish(key, JSON.stringify(event));
    }

    private get_redis_key(game_session_id: string) {
        return `game_session:${game_session_id}`;
    }
}
