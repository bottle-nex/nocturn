import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// In-memory stand-in for ioredis. The real RedisCache runs on top of it, so the
// tests exercise the real cache code paths while staying single-process.
// ---------------------------------------------------------------------------
const { FakeRedis, services } = vi.hoisted(() => {
    // .env.test predates the Solana settings that env.ts now requires.
    process.env.SERVER_PLATFORM_AUTHORITY_KEYPAIR ??= 'test-keypair';

    class FakeRedis {
        static store = {
            strings: new Map<string, string>(),
            hashes: new Map<string, Map<string, string>>(),
            zsets: new Map<string, Map<string, number>>(),
        };

        static reset() {
            FakeRedis.store.strings.clear();
            FakeRedis.store.hashes.clear();
            FakeRedis.store.zsets.clear();
        }

        private hash(key: string) {
            if (!FakeRedis.store.hashes.has(key)) FakeRedis.store.hashes.set(key, new Map());
            return FakeRedis.store.hashes.get(key)!;
        }

        private zset(key: string) {
            if (!FakeRedis.store.zsets.has(key)) FakeRedis.store.zsets.set(key, new Map());
            return FakeRedis.store.zsets.get(key)!;
        }

        private sorted(key: string) {
            return [...this.zset(key).entries()].sort((a, b) => b[1] - a[1]);
        }

        async expire() {
            return 1;
        }
        async del(...keys: string[]) {
            for (const k of keys) {
                FakeRedis.store.strings.delete(k);
                FakeRedis.store.hashes.delete(k);
                FakeRedis.store.zsets.delete(k);
            }
            return keys.length;
        }
        async get(key: string) {
            return FakeRedis.store.strings.get(key) ?? null;
        }
        async set(key: string, value: string, ...args: (string | number)[]) {
            if (args.includes('NX') && FakeRedis.store.strings.has(key)) return null;
            FakeRedis.store.strings.set(key, value);
            return 'OK';
        }
        async hset(key: string, ...fv: string[]) {
            for (let i = 0; i < fv.length; i += 2) this.hash(key).set(fv[i]!, fv[i + 1]!);
            return fv.length / 2;
        }
        async hsetnx(key: string, field: string, value: string) {
            if (this.hash(key).has(field)) return 0;
            this.hash(key).set(field, value);
            return 1;
        }
        async hget(key: string, field: string) {
            return this.hash(key).get(field) ?? null;
        }
        async hmget(key: string, ...fields: string[]) {
            return fields.map((f) => this.hash(key).get(f) ?? null);
        }
        async hgetall(key: string) {
            return Object.fromEntries(this.hash(key));
        }
        async hdel(key: string, ...fields: string[]) {
            fields.forEach((f) => this.hash(key).delete(f));
            return fields.length;
        }
        async hscan(key: string, _cursor: string, _m: string, pattern: string) {
            const prefix = pattern.replace(/\*$/, '');
            const flat: string[] = [];
            for (const [f, v] of this.hash(key)) if (f.startsWith(prefix)) flat.push(f, v);
            return ['0', flat];
        }
        async zadd(key: string, ...args: (string | number)[]) {
            const nx = args[0] === 'NX';
            const [score, member] = nx ? args.slice(1) : args;
            if (nx && this.zset(key).has(String(member))) return 0;
            this.zset(key).set(String(member), Number(score));
            return 1;
        }
        async zincrby(key: string, inc: number, member: string) {
            const next = (this.zset(key).get(member) ?? 0) + Number(inc);
            this.zset(key).set(member, next);
            return String(next);
        }
        async zscore(key: string, member: string) {
            const s = this.zset(key).get(member);
            return s === undefined ? null : String(s);
        }
        async zrem(key: string, member: string) {
            return this.zset(key).delete(member) ? 1 : 0;
        }
        async zcard(key: string) {
            return this.zset(key).size;
        }
        async zrevrank(key: string, member: string) {
            const i = this.sorted(key).findIndex(([m]) => m === member);
            return i === -1 ? null : i;
        }
        async zrevrange(key: string, start: number, stop: number) {
            const all = this.sorted(key);
            const slice = all.slice(start, stop === -1 ? undefined : stop + 1);
            return slice.flatMap(([m, s]) => [m, String(s)]);
        }

        pipeline() {
            const calls: (() => Promise<unknown>)[] = [];
            const proxy: Record<string, unknown> = {
                exec: async () => {
                    const out: [null, unknown][] = [];
                    for (const c of calls) out.push([null, await c()]);
                    return out;
                },
            };
            return new Proxy(proxy, {
                get: (target, prop: string) => {
                    if (prop in target) return target[prop];
                    return (...args: unknown[]) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        calls.push(() => (this as any)[prop](...args));
                        return proxy;
                    };
                },
            });
        }
    }

    const services = {
        email_service_queue_instance: { email_winner_notification: vi.fn() },
        solanaServiceInstance: {
            finalize_quiz_onchain: vi.fn(),
            seal_quiz_onchain: vi.fn().mockResolvedValue('seal-sig'),
        },
    };

    return { FakeRedis, services };
});

vi.mock('ioredis', () => ({ default: FakeRedis }));
vi.mock('@nocturn/database', () => {
    // Prisma enums are plain string maps; mirror them as `KEY: 'KEY'`.
    const enumLike = new Proxy({}, { get: (_t, key) => key });
    return {
        prisma: { quiz: { findUnique: vi.fn(), update: vi.fn() } },
        QuizPhase: enumLike,
        HostScreen: enumLike,
        ParticipantScreen: enumLike,
        SpectatorScreen: enumLike,
        QuizStatus: enumLike,
    };
});
vi.mock('../../services/init.services', () => ({
    ...services,
    quizSettingInstance: { quiz_settings_mapping: new Map() },
    default: vi.fn(),
}));

import { prisma, QuizPhase } from '@nocturn/database';
import { MESSAGE_TYPES } from '@nocturn/types';
import RedisCache from '../../cache/redis.cache';
import ParticipantManager, {
    ParticipantManagerDependencies,
} from '../../sockets/ParticipantManager';
import HostManager, { HostManagerDependencies } from '../../sockets/HostManager';
import PrizeQueue from '../../queue/prize/prize.queue';

/* eslint-disable @typescript-eslint/no-explicit-any */

const SESSION = 'session-1';
const QUIZ = 'quiz-1';
const tick = () => new Promise((r) => setTimeout(r, 0));
const flush = () => new Promise((r) => setTimeout(r, 20));

// Mirrors the orchestrator's database job worker, but never refreshes the
// Redis cache — exactly what happens while the job queue is backed up.
function makeLaggingDatabaseQueue(db: Record<string, any>) {
    const apply = (row: Record<string, any>, data: Record<string, any>) => {
        for (const [k, v] of Object.entries(data)) {
            if (v && typeof v === 'object' && 'increment' in v)
                row[k] = (row[k] ?? 0) + v.increment;
            else row[k] = v;
        }
    };
    return {
        create_participant_response: vi.fn(async () => tick()),
        update_participant: vi.fn(async (id: string, data: Record<string, any>) => {
            await tick();
            db[id] = db[id] ?? {};
            apply(db[id], data);
            return { data: { participant: db[id] } };
        }),
        update_game_session: vi.fn(async () => tick()),
        update_question: vi.fn(async () => tick()),
        update_quiz: vi.fn(async () => tick()),
    };
}

const quizManager = {
    publish_event_to_redis: vi.fn(async (_sessionId: string, _event: any) => {}),
};

function question(id: string, orderIndex: number, isAsked = false) {
    return {
        id,
        orderIndex,
        question: `Q${orderIndex}`,
        options: ['a', 'b', 'c', 'd'],
        correctAnswer: 0,
        basePoints: 100,
        timeLimit: 30,
        readingTime: 5,
        isAsked,
    };
}

async function seedSession(cache: RedisCache, currentQuestionId: string) {
    await cache.set_game_session(SESSION, {
        currentPhase: QuizPhase.QUESTION_ACTIVE,
        currentQuestionId,
        phaseStartTime: new Date(),
        phaseEndTime: new Date(Date.now() + 30_000),
    } as any);
}

function wsFor(userId: string) {
    return { id: `sock-${userId}`, user: { userId, gameSessionId: SESSION, quizId: QUIZ } } as any;
}

beforeEach(() => {
    FakeRedis.reset();
    vi.clearAllMocks();
});

describe('live quiz answer scoring', () => {
    function setup() {
        const cache = new RedisCache();
        const db: Record<string, any> = {};
        const database_queue = makeLaggingDatabaseQueue(db);
        const manager = new ParticipantManager({
            redis_cache: cache,
            databaseQueue: database_queue,
            quizManager,
            socket_mapping: new Map(),
            session_participants_mapping: new Map(),
            session_spectators_mapping: new Map(),
        } as unknown as ParticipantManagerDependencies);
        const answer = (userId: string, selectedAnswer: number) =>
            (manager as any).handle_participant_response({ selectedAnswer }, wsFor(userId));
        return { cache, db, database_queue, answer };
    }

    it('scores a double-tapped answer only once', async () => {
        const { cache, database_queue, answer } = setup();
        await cache.set_quiz(SESSION, { timeBonus: false, questions: [question('q1', 0)] } as any);
        await cache.set_participant(SESSION, 'p1', { id: 'p1', totalScore: 0 } as any);
        await cache.init_leaderboard_entry(SESSION, 'p1');
        await seedSession(cache, 'q1');

        await Promise.all([answer('p1', 0), answer('p1', 0)]);

        expect(database_queue.create_participant_response).toHaveBeenCalledTimes(1);
        expect(await cache.get_participant_score(SESSION, 'p1')).toBe(110);
    });

    it('keeps earlier points when the participant cache has not caught up yet', async () => {
        const { cache, db, answer } = setup();
        await cache.set_quiz(SESSION, {
            timeBonus: false,
            questions: [question('q1', 0), question('q2', 1)],
        } as any);
        await cache.set_participant(SESSION, 'p1', { id: 'p1', totalScore: 0 } as any);
        db.p1 = { totalScore: 0, correctAnswers: 0 };

        await seedSession(cache, 'q1');
        await answer('p1', 0);
        await seedSession(cache, 'q2');
        await answer('p1', 0);

        // base 100 + streak bonus 10, then base 100 + streak bonus 20
        expect(db.p1.totalScore).toBe(230);
        expect(db.p1.correctAnswers).toBe(2);
    });

    it('does not wipe a participant’s leaderboard score when they reconnect', async () => {
        const { cache, answer } = setup();
        await cache.set_quiz(SESSION, { timeBonus: false, questions: [question('q1', 0)] } as any);
        await cache.set_participant(SESSION, 'p1', { id: 'p1', totalScore: 0 } as any);
        await cache.init_leaderboard_entry(SESSION, 'p1');
        await seedSession(cache, 'q1');
        await answer('p1', 0);

        // reconnecting runs QuizManager.onParticipantConnect -> init_leaderboard_entry
        await cache.init_leaderboard_entry(SESSION, 'p1');

        expect(await cache.get_participant_score(SESSION, 'p1')).toBe(110);
    });
});

describe('host controls', () => {
    function setup() {
        const cache = new RedisCache();
        const database_queue = makeLaggingDatabaseQueue({});
        const phase_queue = { schedule_phase_transition: vi.fn(async () => {}) };
        const manager = new HostManager({
            redis_cache: cache,
            databaseQueue: database_queue,
            quizManager,
            phase_queue,
            socketMapping: new Map(),
            sessionHostMapping: new Map(),
        } as unknown as HostManagerDependencies);
        return { cache, phase_queue, manager };
    }

    it('starts a question once when the host taps start twice', async () => {
        const { cache, phase_queue, manager } = setup();
        await cache.set_quiz(SESSION, { questions: [question('q1', 0)] } as any);

        const launch = () =>
            (manager as any).handle_question_launch(
                { questionId: 'q1', questionIndex: 0 },
                wsFor('host'),
            );
        await Promise.all([launch(), launch()]);

        const readingBroadcasts = quizManager.publish_event_to_redis.mock.calls.filter(
            (c: any[]) => c[1].type === MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT,
        );
        expect(readingBroadcasts).toHaveLength(1);
        expect(phase_queue.schedule_phase_transition).toHaveBeenCalledTimes(1);
    });

    it('pays exactly the winners shown on the results screen, once', async () => {
        const { cache, manager } = setup();
        await cache.set_quiz(SESSION, {
            prizePool: 60,
            questions: [question('q1', 0, true)],
        } as any);
        const players: [string, number, boolean][] = [
            ['kicked', 500, true],
            ['alice', 300, false],
            ['bob', 300, false],
            ['carol', 100, false],
        ];
        for (const [id, score, isKicked] of players) {
            await cache.set_participant(SESSION, id, { id, nickname: id, isKicked } as any);
            await cache.set_leaderboard_score(SESSION, id, score);
        }

        const p = prisma as any;
        p.prizeDistribution = {
            findMany: vi.fn().mockResolvedValue([
                { rank: 1, percentage: 50 },
                { rank: 2, percentage: 30 },
                { rank: 3, percentage: 20 },
            ]),
        };
        p.participant = {
            findUnique: vi.fn(async ({ where }: any) => ({
                email: `${where.id}@x.io`,
                nickname: where.id,
            })),
        };
        const created: any[] = [];
        p.prizeClaim = {
            create: vi.fn(async ({ data }: any) => created.push(data)),
            createMany: vi.fn(async ({ data }: any) => created.push(...data)),
            count: vi.fn(async () => created.length),
        };
        p.quiz.findUnique.mockResolvedValue({ prizePool: 60, title: 'Quiz' });

        await (manager as any).handle_quiz_results(wsFor('host'));
        await flush();
        await (manager as any).handle_quiz_results(wsFor('host'));
        await flush();

        const results = quizManager.publish_event_to_redis.mock.calls.find(
            (c: any[]) => c[1].type === MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS,
        )![1] as any;
        const shown = results.payload.rankers.map((r: any) => [r.id, r.finalRank]);
        const paid = created.map((c) => [c.participantId, c.rank]);

        expect(shown).toEqual([
            ['alice', 1],
            ['bob', 1],
            ['carol', 3],
        ]);
        expect(paid).toEqual(shown);
    });
});

describe('prize finalization', () => {
    it('sends each winner one email even when the job is retried', async () => {
        const sent = new Map<string, Date | null>([
            ['c1', null],
            ['c2', null],
        ]);
        const p = prisma as any;
        p.prizeClaim = {
            update: vi.fn(async ({ where, data }: any) => sent.set(where.id, data.emailSentAt)),
            updateMany: vi.fn(async ({ where, data }: any) => {
                if (where.emailSentAt === null && sent.get(where.id) !== null) return { count: 0 };
                sent.set(where.id, data.emailSentAt);
                return { count: 1 };
            }),
        };
        p.quiz.update.mockResolvedValue({});

        // First attempt: claim 1 lands, claim 2 hits a transient RPC failure.
        const finalize = services.solanaServiceInstance.finalize_quiz_onchain;
        finalize
            .mockResolvedValueOnce('sig-1')
            .mockRejectedValueOnce(new Error('rpc timeout'))
            .mockRejectedValueOnce(new Error('account already in use'))
            .mockResolvedValueOnce('sig-2');

        const queue = Object.create(PrizeQueue.prototype);
        const claim = (id: string, rank: number) => ({
            id,
            claimToken: `tok-${id}`,
            emailHash: 'ab',
            amountBaseUnits: '1000000',
            rank,
            participantEmail: `${id}@x.io`,
            participantName: id,
            expiresAt: new Date().toISOString(),
        });
        const job = {
            quizId: QUIZ,
            quizAccountPda: 'pda',
            escrowPda: 'escrow',
            hostWalletPubkey: 'host',
            claims: [claim('c1', 1), claim('c2', 2)],
            quizTitle: 'Quiz',
        };

        await expect(queue.process_finalization(job)).rejects.toThrow('rpc timeout');
        await queue.process_finalization(job); // Bull retry

        const emails =
            services.email_service_queue_instance.email_winner_notification.mock.calls.map(
                (c: any[]) => c[0].email,
            );
        expect(emails).toEqual(['c1@x.io', 'c2@x.io']);
    });
});
