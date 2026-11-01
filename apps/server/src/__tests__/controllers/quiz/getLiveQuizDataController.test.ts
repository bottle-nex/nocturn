import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import QuizAction from '../../../class/quizAction';
import getLiveQuizDataController from '../../../controllers/live-quiz-controller/getLiveQuizDataController';

const { cache, transaction } = vi.hoisted(() => ({
    cache: {
        get_live_quiz_batch: vi.fn(),
        get_host: vi.fn(),
        get_participant: vi.fn(),
        get_spectator: vi.fn(),
        get_participant_response: vi.fn(),
        get_top_leaderboards: vi.fn(),
        get_leaderboard_count: vi.fn(),
        get_participant_rank: vi.fn(),
        get_participant_score: vi.fn(),
    },
    transaction: vi.fn(),
}));

vi.mock('../../../services/init.services', () => ({ redisCacheInstance: cache }));
vi.mock('@nocturn/database', () => ({
    HostScreen: {
        LOBBY: 'LOBBY',
        QUESTION_READING: 'QUESTION_READING',
        QUESTION_ACTIVE: 'QUESTION_ACTIVE',
        QUESTION_RESULTS: 'QUESTION_RESULTS',
    },
    prisma: { $transaction: transaction },
}));
vi.mock('../../../controllers/chat-controller/getChatsController', () => ({
    default: vi.fn().mockResolvedValue({ success: true, messages: [] }),
}));

const app = express();
app.get('/live/:quizId', getLiveQuizDataController);
const question = {
    id: 'question',
    question: 'Which answer?',
    options: ['A', 'B'],
    correctAnswer: 1,
    explanation: 'Because B',
    isAsked: true,
};
const leaders = Array.from({ length: 25 }, (_, index) => ({
    id: `player-${index}`,
    nickname: `Player ${index}`,
    avatar: null,
    totalScore: 2500 - index * 100,
    finalRank: null,
}));
const gameSession = {
    id: 'session',
    hostScreen: 'QUESTION_RESULTS',
    participantScreen: 'QUESTION_RESULTS',
    spectatorScreen: 'QUESTION_RESULTS',
    currentQuestionId: question.id,
    currentPhase: 'SHOW_RESULTS',
    phaseStartTime: '2026-11-01T10:00:00.000Z',
    phaseEndTime: null,
    quizEndScreen: null,
};

function authenticate(role: USER_TYPE) {
    vi.spyOn(QuizAction, 'verifyCookie').mockReturnValue({
        quizId: 'quiz',
        gameSessionId: 'session',
        role,
        userId: 'player-24',
    });
}

function fetchSnapshot() {
    return request(app).get('/live/quiz').set('Cookie', `${NOCTURN_COOKIE_NAME}=test-token`);
}

describe('live quiz restoration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cache.get_live_quiz_batch.mockResolvedValue({
            gameSession,
            quiz: { id: 'quiz', questions: [question] },
            cachedParticipants: leaders,
            cachedSpectators: [],
        });
        cache.get_host.mockResolvedValue({ id: 'player-24' });
        cache.get_participant.mockResolvedValue(leaders[24]);
        cache.get_spectator.mockResolvedValue({ id: 'player-24' });
        cache.get_participant_response.mockResolvedValue({
            questionId: question.id,
            selectedAnswer: 1,
            pointsEarned: 100,
        });
        cache.get_top_leaderboards.mockResolvedValue(
            leaders.slice(0, 10).map((leader, index) => ({ ...leader, rank: index + 1 })),
        );
        cache.get_leaderboard_count.mockResolvedValue(25);
        cache.get_participant_rank.mockResolvedValue(25);
        cache.get_participant_score.mockResolvedValue(100);
    });

    it.each([USER_TYPE.HOST, USER_TYPE.PARTICIPANT, USER_TYPE.SPECTATOR])(
        'restores question results and leaderboard for %s',
        async (role) => {
            authenticate(role);
            const { body } = await fetchSnapshot().expect(200);
            expect(body.data.topScores).toHaveLength(10);
            expect(body.data.totalParticipants).toBe(25);
            expect(body.data.currentQuestion).toMatchObject({
                id: question.id,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
            });
            expect(body.data.gameSession.currentPhase).toBe('SHOW_RESULTS');
            expect(body.data.myRank).toBe(role === USER_TYPE.PARTICIPANT ? 25 : null);
            expect(body.data.myScore).toBe(role === USER_TYPE.PARTICIPANT ? 100 : null);
        },
    );

    it.each([USER_TYPE.PARTICIPANT, USER_TYPE.SPECTATOR])(
        'restores active timing without exposing the answer for %s',
        async (role) => {
            authenticate(role);
            const activeSession = {
                ...gameSession,
                hostScreen: 'QUESTION_ACTIVE',
                participantScreen: 'QUESTION_ACTIVE',
                spectatorScreen: 'QUESTION_ACTIVE',
                currentPhase: 'ACTIVE',
                phaseEndTime: '2026-11-01T10:00:30.000Z',
            };
            cache.get_live_quiz_batch.mockResolvedValueOnce({
                gameSession: activeSession,
                quiz: { id: 'quiz', questions: [question] },
                cachedParticipants: leaders,
                cachedSpectators: [],
            });
            const { body } = await fetchSnapshot().expect(200);
            expect(body.data.gameSession.phaseEndTime).toBe(activeSession.phaseEndTime);
            expect(body.data.currentQuestion.id).toBe(question.id);
            expect(body.data.currentQuestion.options).toEqual(question.options);
            expect(body.data.currentQuestion).not.toHaveProperty('correctAnswer');
            expect(body.data.currentQuestion).not.toHaveProperty('explanation');
        },
    );

    it.each([USER_TYPE.HOST, USER_TYPE.PARTICIPANT, USER_TYPE.SPECTATOR])(
        'restores results from the database after a cache miss for %s',
        async (role) => {
            authenticate(role);
            cache.get_live_quiz_batch.mockResolvedValueOnce({});
            const findParticipants = vi.fn().mockResolvedValue(leaders);
            const tx = {
                gameSession: { findUnique: vi.fn().mockResolvedValue(gameSession) },
                quiz: { findUnique: vi.fn().mockResolvedValue({ id: 'quiz' }) },
                question: {
                    count: vi.fn().mockResolvedValue(1),
                    findUnique: vi.fn().mockResolvedValue(question),
                },
                participant: {
                    findMany: findParticipants,
                    findFirst: vi.fn().mockResolvedValue(leaders[24]),
                },
                user: { findUnique: vi.fn().mockResolvedValue({ id: 'player-24' }) },
                spectator: {
                    findMany: vi.fn().mockResolvedValue([]),
                    findFirst: vi.fn().mockResolvedValue({ id: 'player-24' }),
                },
                response: {
                    findFirst: vi
                        .fn()
                        .mockResolvedValue({ questionId: question.id, selectedAnswer: 1 }),
                },
            };
            transaction.mockImplementationOnce((callback) => callback(tx));
            const { body } = await fetchSnapshot().expect(200);
            expect(body.data.topScores).toHaveLength(10);
            expect(body.data.participants).toHaveLength(20);
            expect(body.data.totalParticipants).toBe(25);
            expect(body.data.myRank).toBe(role === USER_TYPE.PARTICIPANT ? 25 : null);
            expect(body.data.myScore).toBe(role === USER_TYPE.PARTICIPANT ? 100 : null);
            expect(body.data.currentQuestion).toMatchObject({
                id: question.id,
                correctAnswer: question.correctAnswer,
            });
            expect(findParticipants).toHaveBeenCalledWith(
                expect.objectContaining({ orderBy: [{ totalScore: 'desc' }, { id: 'desc' }] }),
            );
        },
    );
});
