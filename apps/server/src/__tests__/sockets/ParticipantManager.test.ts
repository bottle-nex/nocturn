import { beforeEach, describe, expect, it, vi } from 'vitest';
import Redis from 'ioredis';
import WebSocket from 'ws';
import { QuizPhase } from '@nocturn/database';
import { MESSAGE_TYPES, USER_TYPE } from '@nocturn/types';
import RedisCache from '../../cache/redis.cache';
import DatabaseQueue from '../../queue/database/database.queue';
import ParticipantManager from '../../sockets/ParticipantManager';
import QuizManager from '../../sockets/QuizManager';

const { hashes, hsetnx, expire, hscan } = vi.hoisted(() => {
    const hashes = new Map<string, Map<string, string>>();
    return {
        hashes,
        hsetnx: vi.fn(async (key: string, field: string, value: string) => {
            const hash = hashes.get(key) ?? new Map<string, string>();
            if (hash.has(field)) return 0;
            hash.set(field, value);
            hashes.set(key, hash);
            return 1;
        }),
        expire: vi.fn(async () => 1),
        hscan: vi.fn(async () => [
            '0',
            ['player:totalScore', '0', 'player:currentStreak', '0', 'player:longestStreak', '0'],
        ]),
    };
});

vi.mock('@nocturn/database', () => ({
    QuizPhase: { QUESTION_ACTIVE: 'QUESTION_ACTIVE', QUESTION_READING: 'QUESTION_READING' },
}));
vi.mock('../../configs/env', () => ({
    env: { SERVER_REDIS_URL: 'redis://localhost:6379' },
}));
vi.mock('ioredis', () => ({
    default: class {
        hsetnx = hsetnx;
        expire = expire;
        hscan = hscan;
    },
}));
vi.mock('ws', () => ({ default: class {} }));
vi.mock('../../queue/database/database.queue', () => ({
    default: class {
        create_participant_response = vi.fn().mockResolvedValue(undefined);
        update_participant = vi.fn().mockResolvedValue(undefined);
    },
}));
vi.mock('../../sockets/QuizManager', () => ({
    default: class {
        publish_event_to_redis = vi.fn();
    },
}));

function createFixture() {
    const redis_cache = new RedisCache();
    const databaseQueue = new DatabaseQueue();
    const publisher = new Redis();
    const subscriber = new Redis();
    const quizManager = new QuizManager({
        publisher,
        subscriber,
        redis_cache,
        database_queue: databaseQueue,
    });
    const dependencies = {
        publisher,
        subscriber,
        redis_cache,
        databaseQueue,
        quizManager,
        socket_mapping: new Map(),
        session_participants_mapping: new Map(),
        session_spectators_mapping: new Map(),
    };
    const manager = new ParticipantManager(dependencies);
    const gameSession = {
        currentPhase: QuizPhase.QUESTION_ACTIVE,
        currentQuestionId: 'question',
        phaseStartTime: new Date(Date.now() - 1000),
        phaseEndTime: new Date(Date.now() + 30000),
    };
    vi.spyOn(redis_cache, 'get_game_session').mockResolvedValue(gameSession);
    vi.spyOn(redis_cache, 'get_quiz').mockResolvedValue({
        timeBonus: false,
        questions: [
            {
                id: 'question',
                quizId: 'quiz',
                question: 'Choose the correct answer',
                options: ['Incorrect', 'Correct'],
                correctAnswer: 1,
                basePoints: 100,
                timeLimit: 30,
                difficulty: 1,
                readingTime: 7,
                imagePosition: 'RIGHT',
                orderIndex: 0,
                imageUrl: null,
                explanation: null,
                hint: null,
                isAsked: true,
                hintLaunched: false,
            },
        ],
    });
    const score = vi.spyOn(redis_cache, 'update_leaderboard_score').mockResolvedValue(undefined);
    const ws = Object.assign(new WebSocket('ws://localhost'), {
        id: 'socket',
        user: {
            userId: 'player',
            gameSessionId: 'session',
            quizId: 'quiz',
            role: USER_TYPE.PARTICIPANT,
            name: 'Player',
            tokenId: 'token',
            iat: 0,
            exp: 0,
        },
    });
    return {
        manager,
        dependencies,
        redis_cache,
        databaseQueue,
        quizManager,
        score,
        ws,
        gameSession,
    };
}

describe('ParticipantManager answer acceptance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hashes.clear();
    });

    it('scores only the first of two concurrent answers across managers', async () => {
        const { manager, dependencies, databaseQueue, quizManager, score, ws } = createFixture();
        const otherManager = new ParticipantManager(dependencies);

        await Promise.all([
            manager['handle_participant_response']({ selectedAnswer: 1 }, ws),
            otherManager['handle_participant_response']({ selectedAnswer: 0 }, ws),
        ]);

        expect(databaseQueue.create_participant_response).toHaveBeenCalledExactlyOnceWith(
            'player',
            'session',
            expect.objectContaining({ selectedAnswer: 1, pointsEarned: 110 }),
        );
        expect(databaseQueue.update_participant).toHaveBeenCalledTimes(1);
        expect(score).toHaveBeenCalledExactlyOnceWith('session', 'player', 110);
        expect(quizManager.publish_event_to_redis).toHaveBeenCalledWith('session', {
            type: MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE,
            payload: { error: 'Already opted an option.' },
            only_socket_id: 'socket',
        });
        expect(quizManager.publish_event_to_redis).toHaveBeenCalledTimes(2);
    });

    it('rejects another answer while the first database enqueue is still pending', async () => {
        const { manager, databaseQueue, score, ws } = createFixture();
        let finishWrite!: () => void;
        let startedWrite!: () => void;
        const pendingWrite = new Promise<void>((resolve) => {
            finishWrite = resolve;
        });
        const started = new Promise<void>((resolve) => {
            startedWrite = resolve;
        });
        vi.mocked(databaseQueue.create_participant_response).mockImplementationOnce(async () => {
            startedWrite();
            await pendingWrite;
        });

        const first = manager['handle_participant_response']({ selectedAnswer: 1 }, ws);
        await started;
        try {
            await manager['handle_participant_response']({ selectedAnswer: 0 }, ws);
            expect(databaseQueue.create_participant_response).toHaveBeenCalledTimes(1);
            expect(score).not.toHaveBeenCalled();
            const cached = hashes.get('game_session:session:responses')?.get('question_player');
            expect(JSON.parse(cached ?? 'null')).toMatchObject({
                selectedAnswer: 1,
                pointsEarned: 110,
            });
        } finally {
            finishWrite();
            await first;
        }
        expect(score).toHaveBeenCalledTimes(1);
    });

    it('keeps an incorrect first answer when the player submits a correct answer later', async () => {
        const { manager, databaseQueue, score, ws } = createFixture();
        await manager['handle_participant_response']({ selectedAnswer: 0 }, ws);
        await manager['handle_participant_response']({ selectedAnswer: 1 }, ws);
        expect(databaseQueue.create_participant_response).toHaveBeenCalledExactlyOnceWith(
            'player',
            'session',
            expect.objectContaining({ selectedAnswer: 0, pointsEarned: 0 }),
        );
        expect(score).toHaveBeenCalledExactlyOnceWith('session', 'player', 0);
    });

    it('does not queue or score an answer if Redis cannot accept it', async () => {
        const { manager, databaseQueue, score, ws } = createFixture();
        hsetnx.mockRejectedValueOnce(new Error('Redis unavailable'));
        await expect(
            manager['handle_participant_response']({ selectedAnswer: 1 }, ws),
        ).rejects.toThrow('Redis unavailable');
        expect(databaseQueue.create_participant_response).not.toHaveBeenCalled();
        expect(databaseQueue.update_participant).not.toHaveBeenCalled();
        expect(score).not.toHaveBeenCalled();
    });

    it.each(['phase', 'deadline', 'question'] as const)(
        'does not reserve an answer rejected by %s validation',
        async (invalid) => {
            const { manager, redis_cache, databaseQueue, ws, gameSession } = createFixture();
            if (invalid === 'phase') gameSession.currentPhase = QuizPhase.QUESTION_READING;
            if (invalid === 'deadline') gameSession.phaseEndTime = new Date(Date.now() - 1000);
            if (invalid === 'question')
                vi.mocked(redis_cache.get_quiz).mockResolvedValue({ questions: [] });
            await manager['handle_participant_response']({ selectedAnswer: 1 }, ws);
            expect(hsetnx).not.toHaveBeenCalled();
            expect(databaseQueue.create_participant_response).not.toHaveBeenCalled();
        },
    );

    it('scopes acceptance to the session, question and participant and expires the response hash', async () => {
        const cache = new RedisCache();
        const response = { selectedAnswer: 1, pointsEarned: 100 };
        expect(await cache.try_set_participant_response('s1', 'q1', 'p1', response)).toBe(true);
        expect(
            await cache.try_set_participant_response('s1', 'q1', 'p1', { selectedAnswer: 0 }),
        ).toBe(false);
        expect(await cache.try_set_participant_response('s2', 'q1', 'p1', response)).toBe(true);
        expect(await cache.try_set_participant_response('s1', 'q2', 'p1', response)).toBe(true);
        expect(await cache.try_set_participant_response('s1', 'q1', 'p2', response)).toBe(true);
        expect(expire).toHaveBeenCalledWith('game_session:s1:responses', 86400);
        expect(expire).toHaveBeenCalledTimes(4);
        expect(JSON.parse(hashes.get('game_session:s1:responses')?.get('q1_p1') ?? 'null')).toEqual(
            response,
        );
    });
});
