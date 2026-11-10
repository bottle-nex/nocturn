import { beforeEach, describe, expect, it, vi } from 'vitest';
import Redis from 'ioredis';
import WebSocket from 'ws';
import { USER_TYPE } from '@nocturn/types';
import ParticipantManager from '../../sockets/ParticipantManager';
import QuizManager from '../../sockets/QuizManager';
import RedisCache from '../../cache/redis.cache';
import DatabaseQueue from '../../queue/database/database.queue';

vi.mock('ioredis');
vi.mock('ws');
vi.mock('../../cache/redis.cache');
vi.mock('../../queue/database/database.queue');
vi.mock('../../sockets/QuizManager');
vi.mock('@nocturn/database', () => ({
    prisma: {},
    QuizPhase: { QUESTION_ACTIVE: 'QUESTION_ACTIVE' },
}));

const redis = new Redis();
const cache = new RedisCache();
const queue = new DatabaseQueue();
const quizManager = new QuizManager({
    publisher: redis,
    subscriber: redis,
    redis_cache: cache,
    database_queue: queue,
});
const manager = new ParticipantManager({
    publisher: redis,
    subscriber: redis,
    redis_cache: cache,
    databaseQueue: queue,
    quizManager,
    socket_mapping: new Map(),
    session_participants_mapping: new Map(),
    session_spectators_mapping: new Map(),
});
const ws = Object.assign(new WebSocket(null), {
    id: 'socket-1',
    user: {
        userId: 'participant-1',
        quizId: 'quiz-1',
        gameSessionId: 'session-1',
        role: USER_TYPE.PARTICIPANT,
        name: 'Player',
        tokenId: 'token',
        iat: 0,
        exp: 0,
    },
});
const question = {
    id: 'question-1',
    quizId: 'quiz-1',
    question: 'Earth is flat.',
    format: 'TRUE_FALSE',
    options: ['True', 'False'],
    correctAnswer: 1,
    explanation: null,
    hint: null,
    difficulty: 1,
    basePoints: 100,
    timeLimit: 30,
    readingTime: 7,
    orderIndex: 0,
    imagePosition: 'RIGHT',
    imageUrl: null,
    isAsked: true,
    hintLaunched: false,
} as const;

describe('true/false live scoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(cache.get_game_session).mockResolvedValue({
            currentQuestionId: question.id,
            currentPhase: 'QUESTION_ACTIVE',
            phaseStartTime: new Date(),
            phaseEndTime: new Date(Date.now() + 30000),
        });
        vi.mocked(cache.get_participant_response).mockResolvedValue(null);
        vi.mocked(cache.get_quiz).mockResolvedValue({
            timeBonus: false,
            questions: [{ ...question, options: [...question.options] }],
        });
        vi.mocked(cache.get_participant).mockResolvedValue({
            id: 'participant-1',
            nickname: 'Player',
            quizId: 'quiz-1',
            email: 'player@example.com',
            totalScore: 0,
            correctAnswers: 0,
            currentStreak: 0,
            longestStreak: 0,
            avatar: null,
            ipAddress: null,
            isNameChanged: false,
            warningCount: 0,
            isKicked: false,
            isEliminated: false,
            eliminatedAt: null,
            eliminatedAtQuestion: null,
            finalRank: null,
            walletAddress: null,
        });
    });

    it.each([
        { answer: 1, correct: true, points: 110 },
        { answer: 0, correct: false, points: 0 },
    ])('scores answer $answer correctly', async ({ answer, correct, points }) => {
        await manager['handle_participant_response']({ selectedAnswer: answer }, ws);
        expect(queue.create_participant_response).toHaveBeenCalledWith(
            'participant-1',
            'session-1',
            expect.objectContaining({
                selectedAnswer: answer,
                isCorrect: correct,
                pointsEarned: points,
            }),
        );
        expect(cache.update_leaderboard_score).toHaveBeenCalledWith(
            'session-1',
            'participant-1',
            points,
        );
    });

    it.each([-1, 2, 0.5, NaN, Infinity])(
        'does not persist or score invalid answer %s',
        async (selectedAnswer) => {
            await manager['handle_participant_response']({ selectedAnswer }, ws);
            expect(queue.create_participant_response).not.toHaveBeenCalled();
            expect(queue.update_participant).not.toHaveBeenCalled();
            expect(cache.update_leaderboard_score).not.toHaveBeenCalled();
        },
    );

    it('ignores answers submitted outside the active phase', async () => {
        vi.mocked(cache.get_game_session).mockResolvedValue({ currentPhase: 'SHOW_RESULTS' });
        await manager['handle_participant_response']({ selectedAnswer: 1 }, ws);
        expect(queue.create_participant_response).not.toHaveBeenCalled();
    });
});
