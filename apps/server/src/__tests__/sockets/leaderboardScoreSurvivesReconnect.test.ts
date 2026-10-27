import { describe, expect, it, vi } from 'vitest';

// Minimal Redis double with sorted-set semantics (only what the leaderboard
// code paths use). zadd understands the NX/XX/GT/LT/CH flags like real Redis.
vi.mock('ioredis', () => {
    class FakeRedis {
        private zsets = new Map<string, Map<string, number>>();

        private zset(key: string) {
            let set = this.zsets.get(key);
            if (!set) {
                set = new Map();
                this.zsets.set(key, set);
            }
            return set;
        }

        async zadd(key: string, ...args: (string | number)[]) {
            const flags: string[] = [];
            while (
                typeof args[0] === 'string' &&
                ['NX', 'XX', 'GT', 'LT', 'CH', 'INCR'].includes(args[0])
            ) {
                flags.push(args.shift() as string);
            }
            const set = this.zset(key);
            let added = 0;
            for (let i = 0; i + 1 < args.length; i += 2) {
                const score = Number(args[i]);
                const member = String(args[i + 1]);
                const current = set.get(member);
                const exists = current !== undefined;
                if (flags.includes('NX') && exists) continue;
                if (flags.includes('XX') && !exists) continue;
                if (flags.includes('GT') && exists && current >= score) continue;
                if (flags.includes('LT') && exists && current <= score) continue;
                if (!exists) added++;
                set.set(member, score);
            }
            return added;
        }

        async zincrby(key: string, increment: number, member: string) {
            const set = this.zset(key);
            const next = (set.get(member) ?? 0) + Number(increment);
            set.set(member, next);
            return String(next);
        }

        async zscore(key: string, member: string) {
            const set = this.zsets.get(key);
            if (!set || !set.has(member)) return null;
            return String(set.get(member));
        }

        async zcard(key: string) {
            return this.zsets.get(key)?.size ?? 0;
        }

        async expire() {
            return 1;
        }

        pipeline() {
            const ops: { op: string; args: unknown[] }[] = [];
            const pipeline = {
                zadd: (...args: unknown[]) => {
                    ops.push({ op: 'zadd', args });
                    return pipeline;
                },
                expire: (...args: unknown[]) => {
                    ops.push({ op: 'expire', args });
                    return pipeline;
                },
                exec: async () => {
                    const client = this as unknown as Record<string, (...a: unknown[]) => unknown>;
                    const results: [Error | null, unknown][] = [];
                    for (const { op, args } of ops) {
                        results.push([null, await client[op](...args)]);
                    }
                    return results;
                },
            };
            return pipeline;
        }
    }
    return { default: FakeRedis };
});

import RedisCache from '../../cache/redis.cache';

// ---------------------------------------------------------------------------
// A participant that refreshes or reconnects mid-quiz must not lose the
// points they already earned. onParticipantConnect runs for every
// (re)connect, so the leaderboard entry init must not reset an existing
// member's score back to zero.
// ---------------------------------------------------------------------------

describe('leaderboard score across reconnects', () => {
    it('keeps the earned score when a participant connects again', async () => {
        const cache = new RedisCache();

        await cache.update_leaderboard_score('session-1', 'participant-1', 100);

        // participant refreshes / reconnects mid-quiz
        await cache.init_leaderboard_entry('session-1', 'participant-1');

        expect(await cache.get_participant_score('session-1', 'participant-1')).toBe(100);
    });

    it('starts a brand new participant at zero', async () => {
        const cache = new RedisCache();

        await cache.init_leaderboard_entry('session-2', 'participant-2');

        expect(await cache.get_participant_score('session-2', 'participant-2')).toBe(0);
    });
});
