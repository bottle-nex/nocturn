import { beforeEach, describe, expect, it, vi } from 'vitest';
import Redis from 'ioredis';
import HostManager from '../../sockets/HostManager';
import QuizManager from '../../sockets/QuizManager';
import DatabaseQueue from '../../queue/database/database.queue';
import RedisCache from '../../cache/redis.cache';
import PhaseQueue from '../../queue/PhaseQueue';
import { getNetPrizePoolBaseUnits } from '@nocturn/types';

const db = vi.hoisted(() => ({
    quiz: { findUnique: vi.fn() },
    prizeDistribution: { findMany: vi.fn() },
    participant: { findUnique: vi.fn() },
    prizeClaim: { create: vi.fn() },
}));
vi.mock('@nocturn/database', () => ({ prisma: db }));
// These dependencies are inert: exercise claim creation without starting Redis,
// sockets or queue workers. QuizManager's publishing method is spied below.
vi.mock('ioredis', () => ({ default: class {} }));
vi.mock('../../queue/database/database.queue', () => ({ default: class {} }));
vi.mock('../../cache/redis.cache', () => ({ default: class {} }));
vi.mock('../../queue/PhaseQueue', () => ({ default: class {} }));

const publisher = new Redis();
const subscriber = new Redis();
const redisCache = new RedisCache();
const databaseQueue = new DatabaseQueue();
const quizManager = new QuizManager({
    publisher,
    subscriber,
    redis_cache: redisCache,
    database_queue: databaseQueue,
});
const publish = vi.spyOn(quizManager, 'publish_event_to_redis').mockResolvedValue(undefined);
const host = new HostManager({
    publisher,
    subscriber,
    redis_cache: redisCache,
    databaseQueue,
    quizManager,
    phase_queue: new PhaseQueue(),
    socketMapping: new Map(),
    sessionHostMapping: new Map(),
});
const entries = (weights: number[]) =>
    weights.map((percentage, i) => ({
        rank: i + 1,
        percentage,
        amount: percentage,
        amountBaseUnits: BigInt(Math.floor(percentage * 1e6)),
    }));
const rankable = (scores: number[]) =>
    scores.map((totalScore, i) => ({ id: `p${i + 1}`, totalScore }));
const createdAmounts = () =>
    db.prizeClaim.create.mock.calls.map(([arg]) => arg.data.amountBaseUnits);

beforeEach(() => {
    vi.clearAllMocks();
    db.quiz.findUnique.mockResolvedValue({ prizePool: 100, title: 'Quiz' });
    db.prizeDistribution.findMany.mockResolvedValue(entries([50, 30, 20]));
    db.participant.findUnique.mockResolvedValue({
        email: 'winner@example.com',
        nickname: 'Winner',
    });
    db.prizeClaim.create.mockResolvedValue({});
});

describe('prize claim creation', () => {
    it('recalculates legacy gross amounts before creating all three claims', async () => {
        await host['create_prize_claims']('quiz', 'session', rankable([30, 20, 10]));
        expect(createdAmounts()).toEqual([
            BigInt(49_500_000),
            BigInt(29_700_000),
            BigInt(19_800_000),
        ]);
        expect(publish).toHaveBeenCalledWith(
            'session',
            expect.objectContaining({ payload: { quizId: 'quiz', totalClaims: 3 } }),
        );
        for (const [arg] of db.prizeClaim.create.mock.calls) {
            expect(arg.data.amount).toBe(Number(arg.data.amountBaseUnits) / 1e6);
        }
    });

    it('pools consumed rank allocations for tied winners', async () => {
        await host['create_prize_claims']('quiz', 'session', rankable([30, 30, 10]));
        expect(createdAmounts()).toEqual([
            BigInt(39_600_000),
            BigInt(39_600_000),
            BigInt(19_800_000),
        ]);
        expect(db.prizeClaim.create.mock.calls.map(([arg]) => arg.data.rank)).toEqual([1, 1, 3]);
    });

    it('floors tied splits in base units and keeps display amounts consistent', async () => {
        db.quiz.findUnique.mockResolvedValueOnce({ prizePool: 1.000199 });
        await host['create_prize_claims']('quiz', 'session', rankable([10, 10, 10, 10]));
        const total = createdAmounts().reduce(
            (sum: bigint, value: bigint) => sum + value,
            BigInt(0),
        );
        expect(total).toBeLessThanOrEqual(getNetPrizePoolBaseUnits(1.000199));
        expect(new Set(createdAmounts()).size).toBe(1);
        for (const [arg] of db.prizeClaim.create.mock.calls) {
            expect(arg.data.amount).toBe(Number(arg.data.amountBaseUnits) / 1e6);
        }
    });

    it('preserves zero allocations and leaves absent ranks unawarded', async () => {
        db.prizeDistribution.findMany.mockResolvedValueOnce(entries([0, 50, 50]));
        await host['create_prize_claims']('quiz', 'session', rankable([10]));
        expect(createdAmounts()).toEqual([BigInt(0)]);
    });

    it('supports missing saved amounts', async () => {
        db.prizeDistribution.findMany.mockResolvedValueOnce([
            { rank: 1, percentage: 100, amount: null, amountBaseUnits: null },
        ]);
        await host['create_prize_claims']('quiz', 'session', rankable([10]));
        expect(createdAmounts()).toEqual([BigInt(99_000_000)]);
    });

    it('does not create claims when distributions are empty or invalid', async () => {
        db.prizeDistribution.findMany.mockResolvedValueOnce([]);
        await host['create_prize_claims']('quiz', 'session', rankable([10]));
        expect(db.prizeClaim.create).not.toHaveBeenCalled();
        db.prizeDistribution.findMany.mockResolvedValueOnce(entries([150]));
        await expect(
            host['create_prize_claims']('quiz', 'session', rankable([10])),
        ).rejects.toThrow('Prize percentages');
        expect(db.prizeClaim.create).not.toHaveBeenCalled();
    });
});
