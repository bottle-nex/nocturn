import { beforeEach, expect, it, vi } from 'vitest';
import { WebSocket } from 'ws';
import Redis from 'ioredis';
import { USER_TYPE } from '@nocturn/types';
import HostManager from '../../sockets/HostManager';
import QuizManager from '../../sockets/QuizManager';
import RedisCache from '../../cache/redis.cache';
import DatabaseQueue from '../../queue/database/database.queue';
import PhaseQueue from '../../queue/PhaseQueue';

const mocks = vi.hoisted(() => ({
    get_quiz: vi.fn(),
    get_full_leaderboard: vi.fn(),
    set_participant: vi.fn(),
    set_game_session: vi.fn(),
    set_quiz: vi.fn(),
    get_top_leaderboards: vi.fn(),
    get_leaderboard_count: vi.fn(),
    publish: vi.fn(),
    quiz: { updateMany: vi.fn(), findUnique: vi.fn() },
    gameSession: { update: vi.fn() },
    participant: { findUnique: vi.fn(), update: vi.fn() },
    prizeDistribution: { findMany: vi.fn() },
    prizeClaim: { create: vi.fn(), count: vi.fn() },
}));
vi.mock('ws', () => ({ WebSocket: class {} }));
vi.mock('ioredis', () => ({ default: class {} }));
vi.mock('../../cache/redis.cache', () => ({
    default: class {
        get_quiz = mocks.get_quiz;
        get_full_leaderboard = mocks.get_full_leaderboard;
        set_participant = mocks.set_participant;
        set_game_session = mocks.set_game_session;
        set_quiz = mocks.set_quiz;
        get_top_leaderboards = mocks.get_top_leaderboards;
        get_leaderboard_count = mocks.get_leaderboard_count;
        get_participants_key() {
            return 'participants';
        }
        redis_cache = {
            pipeline: () => ({
                hget: vi.fn(),
                exec: async () => [
                    [null, 'false'],
                    [null, 'false'],
                    [null, 'false'],
                ],
            }),
        };
    },
}));
vi.mock('../../sockets/QuizManager', () => ({
    default: class {
        publish_event_to_redis = mocks.publish;
    },
}));
vi.mock('../../queue/database/database.queue', () => ({ default: class {} }));
vi.mock('../../queue/PhaseQueue', () => ({ default: class {} }));
vi.mock('@nocturn/database', () => ({
    prisma: {
        ...mocks,
        $transaction: async (fn: (tx: typeof mocks) => Promise<unknown>) => {
            try {
                return await fn(mocks);
            } catch (error) {
                committed = false;
                throw error;
            }
        },
    },
    QuizStatus: { PAYOUT_PENDING: 'PAYOUT_PENDING', COMPLETED: 'COMPLETED' },
    QuizPhase: { QUIZ_RESULTS: 'QUIZ_RESULTS' },
    HostScreen: { QUIZ_RESULTS: 'QUIZ_RESULTS' },
    ParticipantScreen: { QUIZ_RESULTS: 'QUIZ_RESULTS' },
    SpectatorScreen: { QUIZ_RESULTS: 'QUIZ_RESULTS' },
}));
let committed = false;
let manager: HostManager;
const ws = Object.assign(new WebSocket(null), {
    id: 'socket',
    user: {
        userId: 'host',
        quizId: 'quiz',
        gameSessionId: 'session',
        role: USER_TYPE.HOST,
        name: 'Host',
        tokenId: 'token',
        iat: 0,
        exp: 1,
    },
});
const leaderboard = [
    { id: 'p1', totalScore: 10 },
    { id: 'p2', totalScore: 10 },
    { id: 'p3', totalScore: 5 },
];
beforeEach(() => {
    vi.resetAllMocks();
    committed = false;
    const cache = new RedisCache();
    const publisher = new Redis();
    const subscriber = new Redis();
    const databaseQueue = new DatabaseQueue();
    manager = new HostManager({
        publisher,
        subscriber,
        redis_cache: cache,
        databaseQueue,
        phase_queue: new PhaseQueue(),
        socketMapping: new Map(),
        sessionHostMapping: new Map(),
        quizManager: new QuizManager({
            publisher,
            subscriber,
            redis_cache: cache,
            database_queue: databaseQueue,
        }),
    });
    mocks.get_quiz.mockResolvedValue({ questions: [{ isAsked: true }], prizePool: 100 });
    mocks.get_full_leaderboard.mockResolvedValue(leaderboard);
    mocks.get_top_leaderboards.mockResolvedValue(leaderboard);
    mocks.get_leaderboard_count.mockResolvedValue(3);
    mocks.quiz.updateMany.mockImplementation(async () => {
        if (committed) return { count: 0 };
        committed = true;
        return { count: 1 };
    });
    mocks.quiz.findUnique.mockResolvedValue({ prizePool: 100, title: 'Quiz' });
    mocks.prizeDistribution.findMany.mockResolvedValue([
        { rank: 1, percentage: 50 },
        { rank: 2, percentage: 30 },
        { rank: 3, percentage: 20 },
    ]);
    mocks.participant.findUnique.mockImplementation(async ({ where }) => ({
        email: `${where.id}@test.com`,
    }));
    mocks.prizeClaim.count.mockResolvedValue(3);
});
it('creates one atomic set of tied-winner claims when results are requested concurrently', async () => {
    await Promise.all([manager['handle_quiz_results'](ws), manager['handle_quiz_results'](ws)]);
    expect(mocks.prizeClaim.create).toHaveBeenCalledTimes(3);
    expect(mocks.prizeClaim.create.mock.calls.map(([args]) => args.data.amount)).toEqual([
        40, 40, 20,
    ]);
    expect(mocks.participant.update.mock.calls.map(([args]) => args.data.finalRank)).toEqual([
        1, 1, 3,
    ]);
    expect(mocks.gameSession.update).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledTimes(2);
    await manager['handle_quiz_results'](ws);
    expect(mocks.prizeClaim.create).toHaveBeenCalledTimes(3);
    expect(mocks.publish).toHaveBeenCalledTimes(2);
});
it('does not publish results when claim creation fails, and allows a retry', async () => {
    mocks.prizeClaim.create.mockRejectedValueOnce(new Error('DB unavailable'));
    await expect(manager['handle_quiz_results'](ws)).rejects.toThrow('DB unavailable');
    expect(mocks.publish).not.toHaveBeenCalled();
    await manager['handle_quiz_results'](ws);
    expect(mocks.publish).toHaveBeenCalledTimes(2);
});
it('handles results without a prize pool once', async () => {
    mocks.get_quiz.mockResolvedValue({ questions: [{ isAsked: true }], prizePool: 0 });
    await manager['handle_quiz_results'](ws);
    await manager['handle_quiz_results'](ws);
    expect(mocks.prizeClaim.create).not.toHaveBeenCalled();
    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.quiz.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED' }) }),
    );
});
