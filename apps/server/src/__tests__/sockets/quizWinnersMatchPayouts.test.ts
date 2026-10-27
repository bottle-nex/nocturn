import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@nocturn/database';
import { MESSAGE_TYPES } from '@nocturn/types';
import HostManager from '../../sockets/HostManager';
import type RedisCache from '../../cache/redis.cache';

// ---------------------------------------------------------------------------
// The winners shown on the results screen and the people who get paid must
// come from one and the same ranking: kicked participants excluded, ties
// sharing a rank. And prize claims (money!) must be created only once.
// ---------------------------------------------------------------------------

const LEADERBOARD = [
    { id: 'participant-kicked', totalScore: 100 },
    { id: 'participant-a', totalScore: 90 },
    { id: 'participant-b', totalScore: 80 },
    { id: 'participant-b2', totalScore: 80 }, // tied with participant-b
    { id: 'participant-c', totalScore: 70 },
];

const NICKNAMES: Record<string, string> = {
    'participant-kicked': 'Kicked',
    'participant-a': 'Alice',
    'participant-b': 'Bob',
    'participant-b2': 'Bobby',
    'participant-c': 'Carol',
};

class FakeRedisCache {
    public kicked_participants = new Set(['participant-kicked']);

    // inner redis client used by the isKicked pipeline in handle_quiz_results
    public redis_cache = {
        pipeline: () => {
            const fields: string[] = [];
            return {
                hget: (_key: string, field: string) => {
                    fields.push(field);
                },
                exec: async () =>
                    fields.map((field) => [
                        null,
                        this.kicked_participants.has(field.split(':')[0]) ? 'true' : 'false',
                    ]),
            };
        },
    };

    async get_quiz() {
        return { prizePool: 100, questions: [{ id: 'question-1', isAsked: true }] };
    }

    async get_full_leaderboard() {
        return LEADERBOARD;
    }

    async get_all_participants() {
        return LEADERBOARD.map((entry) => ({
            id: entry.id,
            nickname: NICKNAMES[entry.id],
            avatar: null,
        }));
    }

    async get_top_leaderboards() {
        // raw zrevrange: still contains the kicked participant, index ranks
        return LEADERBOARD.slice(0, 10).map((entry, index) => ({
            id: entry.id,
            totalScore: entry.totalScore,
            rank: index + 1,
            nickname: NICKNAMES[entry.id],
            avatar: null,
        }));
    }

    async get_leaderboard_count() {
        return LEADERBOARD.length;
    }

    async set_participant() {}

    async try_acquire_lock() {
        return true;
    }

    get_participants_key() {
        return 'game_session:session-1:participants';
    }
}

function build_manager() {
    const quiz_manager = { publish_event_to_redis: vi.fn(async () => {}) };
    const database_queue = {
        update_game_session: vi.fn(async () => ({})),
        update_question: vi.fn(async () => ({})),
        update_participant: vi.fn(async () => ({})),
        update_quiz: vi.fn(async () => ({})),
    };
    const redis_cache = new FakeRedisCache();
    const manager = new HostManager({
        publisher: {} as never,
        subscriber: {} as never,
        socketMapping: new Map(),
        sessionHostMapping: new Map(),
        quizManager: quiz_manager as never,
        databaseQueue: database_queue as never,
        redis_cache: redis_cache as unknown as RedisCache,
        phase_queue: {} as never,
    });
    return { manager, quiz_manager, database_queue };
}

function build_ws() {
    return {
        id: 'host-socket-1',
        user: {
            userId: 'host-1',
            gameSessionId: 'session-1',
            quizId: 'quiz-1',
            role: 'HOST',
        },
        send: vi.fn(),
        close: vi.fn(),
        readyState: 1,
    } as never;
}

async function run_results_screen(manager: unknown) {
    await (
        manager as unknown as {
            handle_quiz_results: (ws: unknown) => Promise<void>;
        }
    ).handle_quiz_results(build_ws());
    // create_prize_claims is fired without await inside handle_quiz_results;
    // let it settle before asserting on the created claims
    await new Promise((resolve) => setTimeout(resolve, 20));
}

function get_results_event(quiz_manager: { publish_event_to_redis: ReturnType<typeof vi.fn> }) {
    const call = quiz_manager.publish_event_to_redis.mock.calls.find(
        ([, event]) => event.type === MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS,
    );
    expect(call).toBeDefined();
    return call?.[1].payload as {
        rankers: { id: string; finalRank: number }[];
        topScores: { id: string }[];
    };
}

describe('quiz results winners and payouts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(prisma.prizeDistribution.findMany).mockResolvedValue([
            { rank: 1, percentage: 50, amount: null, amountBaseUnits: null },
            { rank: 2, percentage: 30, amount: null, amountBaseUnits: null },
            { rank: 3, percentage: 20, amount: null, amountBaseUnits: null },
        ] as never);
        vi.mocked(prisma.quiz.findUnique).mockResolvedValue({
            prizePool: 100,
            title: 'Test quiz',
        } as never);
        vi.mocked(prisma.participant.findUnique).mockResolvedValue({
            email: 'winner@nocturn.dev',
            nickname: 'Winner',
        } as never);
        vi.mocked(prisma.prizeClaim.create).mockResolvedValue({} as never);
        vi.mocked(prisma.prizeClaim.findFirst).mockResolvedValue(null);
    });

    it('shows the same winners it pays, with kicked players excluded and ties shared', async () => {
        const { manager, quiz_manager } = build_manager();
        await run_results_screen(manager);

        const { rankers, topScores } = get_results_event(quiz_manager);

        // kicked player leads the raw leaderboard but must not be a winner
        expect(topScores.map((entry) => entry.id)).toEqual([
            'participant-a',
            'participant-b',
            'participant-b2',
            'participant-c',
        ]);
        expect(rankers.map((ranker) => ranker.id)).toEqual([
            'participant-a',
            'participant-b',
            'participant-b2',
        ]);
        // tie at rank 2: both share rank 2 (ranks 1, 2, 2)
        expect(rankers.map((ranker) => ranker.finalRank)).toEqual([1, 2, 2]);

        const paid_ids = vi
            .mocked(prisma.prizeClaim.create)
            .mock.calls.map((call) => call[0].data.participantId);
        expect(new Set(paid_ids)).toEqual(new Set(rankers.map((ranker) => ranker.id)));
    });

    it('creates prize claims once even when results are triggered twice', async () => {
        const { manager } = build_manager();

        await run_results_screen(manager);
        expect(prisma.prizeClaim.create).toHaveBeenCalledTimes(3);

        // host sends the results message again (double tap / replay)
        vi.mocked(prisma.prizeClaim.findFirst).mockResolvedValue({ id: 'existing-claim' } as never);
        await run_results_screen(manager);

        expect(prisma.prizeClaim.create).toHaveBeenCalledTimes(3);
    });
});
