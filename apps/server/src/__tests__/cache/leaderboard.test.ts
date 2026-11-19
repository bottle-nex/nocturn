import { describe, expect, it, vi } from 'vitest';
import RedisCache from '../../cache/redis.cache';

const pipeline = vi.hoisted(() => ({
    zadd: vi.fn(),
    expire: vi.fn(),
    exec: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../configs/env', () => ({ env: { SERVER_REDIS_URL: 'redis://localhost' } }));
vi.mock('ioredis', () => ({
    default: class {
        pipeline() {
            return pipeline;
        }
    },
}));

describe('leaderboard initialization', () => {
    it('does not overwrite an existing score when a participant reconnects', async () => {
        const cache = new RedisCache();

        await cache.init_leaderboard_entry('session', 'participant');

        expect(pipeline.zadd).toHaveBeenCalledWith(
            'game_session:session:leaderboard',
            'NX',
            0,
            'participant',
        );
        expect(pipeline.exec).toHaveBeenCalled();
    });
});
