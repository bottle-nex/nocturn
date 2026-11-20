import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const { db, tx } = vi.hoisted(() => {
    const tx = {
        $queryRaw: vi.fn(),
        gameSession: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
        question: { findUnique: vi.fn(), update: vi.fn() },
        participant: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
        response: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
        quiz: {
            findUniqueOrThrow: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        prizeDistribution: { findMany: vi.fn() },
        prizeClaim: { findFirst: vi.fn(), create: vi.fn(), count: vi.fn() },
    };
    return {
        tx,
        db: { $transaction: vi.fn(), prizeClaim: tx.prizeClaim, participant: tx.participant },
    };
});

vi.mock('../../../../../packages/database/src/client', () => ({ prisma: db }));
vi.mock('@nocturn/database', async () => ({
    ...(await import('../../../../../packages/database/generated/client')),
    ...(await import('../../../../../packages/database/src/live-game')),
    prisma: db,
}));
vi.mock('../../../../orchestrator/src/services/init-services', () => ({
    redisCacheInstance: {},
    publisherInstnace: {},
    phaseQueueProcessorInstance: {},
}));

import { acceptAnswer } from '../../../../../packages/database/src/live-game';
import { GameSession, HostScreen, QuizPhase, QuizEndScreen } from '@nocturn/database';
import HostManager from '../../sockets/HostManager';
import ParticipantManager from '../../sockets/ParticipantManager';
import TransitionWorker from '../../../../orchestrator/src/job/transition-worker';
import { DatabaseQueueProcessors } from '../../../../orchestrator/src/queue/processor.database.queue';
import type Bull from 'bull';
import type { GameWebSocket } from '../../types/web-socket-types';

const session = (): Pick<
    GameSession,
    | 'id'
    | 'quizId'
    | 'currentQuestionId'
    | 'currentQuestionIndex'
    | 'currentPhase'
    | 'hostScreen'
    | 'phaseStartTime'
    | 'phaseEndTime'
    | 'quizEndScreen'
> => ({
    id: 'session',
    quizId: 'quiz',
    currentQuestionId: 'question',
    currentQuestionIndex: 0,
    currentPhase: QuizPhase.QUESTION_ACTIVE,
    hostScreen: HostScreen.QUESTION_ACTIVE,
    phaseStartTime: new Date(1000),
    phaseEndTime: new Date(5000),
    quizEndScreen: null,
});
const question = () => ({
    id: 'question',
    quizId: 'quiz',
    orderIndex: 0,
    options: ['yes', 'no'],
    correctAnswer: 0,
    basePoints: 100,
    timeLimit: 4,
    readingTime: 1,
    isAsked: true,
});
const player = () => ({
    id: 'player',
    quizId: 'quiz',
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    correctAnswers: 0,
    isKicked: false,
    nickname: 'Player',
    avatar: null,
    email: 'player@example.com',
    finalRank: null,
});
let state: ReturnType<typeof session>;
let currentQuestion: ReturnType<typeof question>;
let participant: ReturnType<typeof player>;
let responses: Record<string, unknown>[];
let claims: Record<string, unknown>[];
const cache = {
    redis_cache: { hincrby: vi.fn().mockResolvedValue(5) },
    get_participants_key: vi.fn().mockReturnValue('participants'),
    remove_from_leaderboard: vi.fn(),
    set_game_session: vi.fn(),
    set_quiz: vi.fn(),
    set_participant: vi.fn(),
    set_leaderboard_score: vi.fn(),
};
const publisher = { publish_event_to_redis: vi.fn() };
const phaseQueue = { schedule_phase_transition: vi.fn() };
let host: HostManager;
let worker: TransitionWorker;
let ws: GameWebSocket;

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(5000);
    state = session();
    currentQuestion = question();
    participant = player();
    responses = [];
    claims = [];
    // Model the session row lock: concurrent transactions must finish in order.
    let pending = Promise.resolve();
    db.$transaction.mockImplementation((action) => {
        const result = pending.then(() => action(tx));
        pending = result.then(
            () => undefined,
            () => undefined,
        );
        return result;
    });
    tx.gameSession.findUnique.mockImplementation(async () => ({ ...state }));
    tx.gameSession.findUniqueOrThrow.mockImplementation(async () => ({ ...state }));
    tx.gameSession.update.mockImplementation(async ({ data }) => Object.assign(state, data));
    tx.question.findUnique.mockImplementation(async () => currentQuestion);
    tx.participant.findUnique.mockImplementation(async () => participant);
    tx.participant.findMany.mockImplementation(async () =>
        participant.isKicked ? [] : [{ ...participant }],
    );
    tx.participant.update.mockImplementation(async ({ data }) => {
        for (const [key, value] of Object.entries(data)) {
            if (key === 'totalScore' || key === 'correctAnswers') {
                if (
                    typeof value === 'object' &&
                    value !== null &&
                    'increment' in value &&
                    typeof value.increment === 'number'
                ) {
                    participant[key] += value.increment;
                }
            } else Object.assign(participant, { [key]: value });
        }
        return { ...participant };
    });
    tx.response.findUnique.mockImplementation(async () => responses[0] ?? null);
    tx.response.create.mockImplementation(async ({ data }) => {
        const response = { id: 'answer', ...data };
        responses.push(response);
        return response;
    });
    tx.response.findMany.mockImplementation(async () => responses);
    const quiz = () => ({
        id: 'quiz',
        timeBonus: true,
        prizePool: 100,
        title: 'Quiz',
        questions: [currentQuestion],
    });
    tx.quiz.findUniqueOrThrow.mockImplementation(async () => quiz());
    tx.quiz.findUnique.mockImplementation(async () => quiz());
    tx.quiz.findFirst.mockImplementation(async () => quiz());
    tx.prizeDistribution.findMany.mockResolvedValue([
        { rank: 1, amount: 100, amountBaseUnits: BigInt(100000000), percentage: 100 },
    ]);
    tx.prizeClaim.findFirst.mockImplementation(async () => claims[0] ?? null);
    tx.prizeClaim.create.mockImplementation(async ({ data }) => {
        claims.push(data);
        return data;
    });
    tx.prizeClaim.count.mockImplementation(async () => claims.length);
    host = Object.create(HostManager.prototype);
    Object.assign(host, { redis_cache: cache, quizManager: publisher, phase_queue: phaseQueue });
    worker = new TransitionWorker();
    Object.assign(worker, { redis_cache: cache, publisher, phase_queue_processor: phaseQueue });
    ws = Object.create(null);
    Object.assign(ws, {
        id: 'socket',
        user: { userId: 'host', gameSessionId: 'session', quizId: 'quiz' },
    });
});
afterEach(() => vi.useRealTimers());

const transition = () =>
    worker.handle_transition_phase({
        gameSessionId: 'session',
        questionId: 'question',
        questionIndex: 0,
        fromPhase: QuizPhase.QUESTION_ACTIVE,
        toPhase: QuizPhase.SHOW_RESULTS,
        executeAt: 5000,
    });

describe('live answer scoring', () => {
    it('commits exactly one answer and one score for rapid competing taps', async () => {
        const results = await Promise.all(
            Array.from({ length: 20 }, (_, i) => acceptAnswer('session', 'player', i % 2, 1000)),
        );
        expect(results.filter(Boolean)).toHaveLength(1);
        expect(responses).toHaveLength(1);
        expect(responses[0]).toMatchObject({ selectedAnswer: 0, pointsEarned: 160 });
        expect(participant).toMatchObject({ totalScore: 160, correctAnswers: 1, currentStreak: 1 });
        expect(tx.$queryRaw).toHaveBeenCalledTimes(40);
    });

    it.each([999, 5000, 5001])(
        'rejects answers outside the active interval at %s',
        async (answeredAt) => {
            expect(await acceptAnswer('session', 'player', 0, answeredAt)).toBeNull();
            expect(tx.response.create).not.toHaveBeenCalled();
        },
    );

    it.each([-1, 2, 0.5, NaN])('rejects invalid option %s', async (option) => {
        expect(await acceptAnswer('session', 'player', option, 1000)).toBeNull();
    });

    it('scores only the first answer even when it is wrong', async () => {
        await acceptAnswer('session', 'player', 1, 1000);
        await acceptAnswer('session', 'player', 0, 1001);
        expect(participant.totalScore).toBe(0);
        expect(responses[0]).toMatchObject({ selectedAnswer: 1, pointsEarned: 0 });
    });

    it('caps the time bonus at half the base points, including odd base points', async () => {
        currentQuestion.basePoints = 101;
        const accepted = await acceptAnswer('session', 'player', 0, 1000);
        expect(accepted?.response.timeBonus).toBe(50);
    });

    it('includes a last-millisecond answer in the results snapshot and final ranks', async () => {
        await Promise.all([acceptAnswer('session', 'player', 0, 4999), transition()]);
        const message = publisher.publish_event_to_redis.mock.calls.find(
            ([, event]) => event.payload.responses,
        );
        expect(message?.[1].payload.responses).toHaveLength(1);
        expect(message?.[1].payload.responses[0]).toMatchObject({
            selectedAnswer: 0,
            pointsEarned: 110,
        });
        await host['handle_quiz_results'](ws);
        expect(participant.finalRank).toBe(1);
        expect(participant.totalScore).toBe(110);
        expect(claims).toHaveLength(1);
    });
});

describe('phase and finalization guards', () => {
    it.each(['question', 'phase', 'deadline', 'index'])(
        'ignores a stale timer with the wrong %s',
        async (field) => {
            if (field === 'question') state.currentQuestionId = 'next-question';
            if (field === 'phase') state.currentPhase = QuizPhase.SHOW_RESULTS;
            if (field === 'deadline') state.phaseEndTime = new Date(6000);
            if (field === 'index') state.currentQuestionIndex = 1;
            await transition();
            expect(tx.gameSession.update).not.toHaveBeenCalled();
            expect(publisher.publish_event_to_redis).not.toHaveBeenCalled();
        },
    );

    it('starts the active interval in the future and rejects answers in its buffer', async () => {
        state.currentPhase = QuizPhase.QUESTION_READING;
        await worker.handle_transition_phase({
            gameSessionId: 'session',
            questionId: 'question',
            questionIndex: 0,
            fromPhase: QuizPhase.QUESTION_READING,
            toPhase: QuizPhase.QUESTION_ACTIVE,
            executeAt: 5000,
        });
        expect(state.currentPhase).toBe(QuizPhase.QUESTION_ACTIVE);
        expect(state.phaseStartTime).toEqual(new Date(7000));
        expect(await acceptAnswer('session', 'player', 0, 6999)).toBeNull();
        expect(await acceptAnswer('session', 'player', 0, 7000)).not.toBeNull();
    });

    it('does not launch a second question while one is active', async () => {
        await host['handle_question_launch']({ questionId: 'question', questionIndex: 0 }, ws);
        expect(tx.gameSession.update).not.toHaveBeenCalled();
        expect(phaseQueue.schedule_phase_transition).not.toHaveBeenCalled();
    });

    it('persists a launch and its asked marker before scheduling the timer', async () => {
        state.currentPhase = QuizPhase.SHOW_RESULTS;
        currentQuestion.isAsked = false;
        await host['handle_question_launch']({ questionId: 'question', questionIndex: 0 }, ws);
        expect(state.currentPhase).toBe(QuizPhase.QUESTION_READING);
        expect(tx.question.update).toHaveBeenCalledWith({
            where: { id: 'question' },
            data: { isAsked: true },
        });
        expect(phaseQueue.schedule_phase_transition).toHaveBeenCalledTimes(1);
    });

    it('runs a timer only once', async () => {
        await Promise.all([transition(), transition()]);
        expect(tx.gameSession.update).toHaveBeenCalledTimes(1);
        expect(state.currentPhase).toBe(QuizPhase.SHOW_RESULTS);
    });

    it('rejects finalization while the last question is active', async () => {
        await host['handle_quiz_results'](ws);
        expect(claims).toHaveLength(0);
        expect(tx.gameSession.update).not.toHaveBeenCalled();
        expect(publisher.publish_event_to_redis).toHaveBeenCalledWith(
            'session',
            expect.objectContaining({
                only_socket_id: 'socket',
                payload: { error: expect.any(String) },
            }),
        );
    });

    it('creates one claim across concurrent and repeated finalization requests', async () => {
        state.currentPhase = QuizPhase.SHOW_RESULTS;
        state.hostScreen = HostScreen.QUESTION_RESULTS;
        await Promise.all([host['handle_quiz_results'](ws), host['handle_quiz_results'](ws)]);
        await host['handle_quiz_results'](ws);
        expect(claims).toHaveLength(1);
        expect(tx.prizeClaim.create).toHaveBeenCalledTimes(1);
        expect(tx.gameSession.update).toHaveBeenCalledTimes(1);
        expect(state.currentPhase).toBe(QuizPhase.QUIZ_RESULTS);
    });

    it('preserves the announcement screen when results are requested again', async () => {
        state.currentPhase = QuizPhase.SHOW_RESULTS;
        state.hostScreen = HostScreen.QUESTION_RESULTS;
        await host['handle_quiz_results'](ws);
        await host['handle_advance_quiz_end_screen'](ws);
        await host['handle_advance_quiz_end_screen'](ws);
        expect(state.quizEndScreen).toBe(QuizEndScreen.ANNOUNCED);
        await host['handle_quiz_results'](ws);
        expect(state.quizEndScreen).toBe(QuizEndScreen.ANNOUNCED);
        expect(tx.prizeClaim.create).toHaveBeenCalledTimes(1);
    });

    it('does not end a quiz with an unasked question', async () => {
        state.currentPhase = QuizPhase.SHOW_RESULTS;
        state.hostScreen = HostScreen.QUESTION_RESULTS;
        currentQuestion.isAsked = false;
        await host['handle_quiz_results'](ws);
        expect(claims).toHaveLength(0);
        expect(tx.quiz.update).not.toHaveBeenCalled();
    });
});

describe('other participant writes', () => {
    it('persists a kick before results can rank the player', async () => {
        const manager: ParticipantManager = Object.create(ParticipantManager.prototype);
        Object.assign(manager, { redis_cache: cache, quizManager: publisher });
        Object.assign(ws.user, { userId: 'player' });
        await manager['handle_participant_warning_count'](ws);
        expect(participant.isKicked).toBe(true);
        state.currentPhase = QuizPhase.SHOW_RESULTS;
        state.hostScreen = HostScreen.QUESTION_RESULTS;
        await host['handle_quiz_results'](ws);
        expect(claims).toHaveLength(0);
        expect(cache.remove_from_leaderboard).toHaveBeenCalledWith('session', 'player');
    });

    it('does not overwrite live scores when a delayed warning update completes', async () => {
        const processors: DatabaseQueueProcessors = Object.create(
            DatabaseQueueProcessors.prototype,
        );
        Object.assign(processors, { redis_cache: cache });
        const job: Bull.Job = Object.create(null);
        Object.assign(job, {
            data: { id: 'player', game_session_id: 'session', participant: { warningCount: 1 } },
        });
        await processors.update_participant_processor(job);
        expect(cache.set_participant).toHaveBeenCalledWith('session', 'player', {
            warningCount: 1,
        });
        expect(cache.set_leaderboard_score).not.toHaveBeenCalled();
    });
});
