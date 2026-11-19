import { describe, expect, it, vi } from 'vitest';
import RedisCache from '../../cache/redis.cache';

const pipeline = vi.hoisted(() => ({
    zadd: vi.fn(),
    expire: vi.fn(),
    exec: vi.fn().mockResolvedValue([]),
}));
const redis = vi.hoisted(() => ({
    zadd: vi.fn(),
    zrem: vi.fn(),
}));
vi.mock('../../configs/env', () => ({ env: { SERVER_REDIS_URL: 'redis://localhost' } }));
vi.mock('ioredis', () => ({
    default: class {
        pipeline() {
            return pipeline;
        }
        zadd = redis.zadd;
        zrem = redis.zrem;
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

describe('leaderboard score updates', () => {
    it('does not recreate a participant removed while an answer is in flight', async () => {
        const cache = new RedisCache();
        const scores = new Map([['participant', 100]]);
        redis.zrem.mockImplementation(async (_key, id) => {
            scores.delete(id);
        });
        redis.zadd.mockImplementation(async (_key, condition, operation, points, id) => {
            if (condition === 'XX' && operation === 'INCR' && scores.has(id)) {
                const score = (scores.get(id) ?? 0) + points;
                scores.set(id, score);
                return String(score);
            }
            return null;
        });

        await cache.remove_from_leaderboard('session', 'participant');
        const result = await cache.update_leaderboard_score('session', 'participant', 50);

        expect(result).toBeUndefined();
        expect(scores.has('participant')).toBe(false);
        expect(redis.zadd).toHaveBeenCalledWith(
            'game_session:session:leaderboard',
            'XX',
            'INCR',
            50,
            'participant',
        );
    });

    it('increments an eligible participant before removal', async () => {
        const cache = new RedisCache();
        redis.zadd.mockResolvedValueOnce('150');

        await expect(cache.update_leaderboard_score('session', 'participant', 50)).resolves.toBe(
            150,
        );
    });
});
