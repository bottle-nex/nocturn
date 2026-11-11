import { beforeEach, describe, expect, it, vi } from 'vitest';
import RedisCache from '../../cache/redis.cache';

vi.mock('../../configs/env', () => ({
    env: { SERVER_REDIS_URL: 'redis://localhost:6379' },
}));

const { pipeline } = vi.hoisted(() => ({
    pipeline: {
        zadd: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock('ioredis', () => ({
    default: vi.fn().mockImplementation(function () {
        return { pipeline: () => pipeline };
    }),
}));

describe('RedisCache.init_leaderboard_entry', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes a new participant at zero without overwriting an existing score', async () => {
        const cache = new RedisCache();

        await cache.init_leaderboard_entry('session-1', 'participant-1');

        expect(pipeline.zadd).toHaveBeenCalledExactlyOnceWith(
            'game_session:session-1:leaderboard',
            'NX',
            0,
            'participant-1',
        );
        expect(pipeline.expire).toHaveBeenCalledExactlyOnceWith(
            'game_session:session-1:leaderboard',
            60 * 60 * 24,
        );
        expect(pipeline.exec).toHaveBeenCalledOnce();
    });
});
