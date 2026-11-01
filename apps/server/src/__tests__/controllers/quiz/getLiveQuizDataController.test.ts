import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import { NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import { prisma } from '@nocturn/database';
import QuizAction from '../../../class/quizAction';
import ResponseWriter from '../../../class/response_writer';
import { redisCacheInstance } from '../../../services/init.services';
import getLiveQuizDataController from '../../../controllers/live-quiz-controller/getLiveQuizDataController';

vi.mock('@nocturn/database', () => ({
    HostScreen: { LOBBY: 'LOBBY' },
    QuizPhase: { SHOW_RESULTS: 'SHOW_RESULTS', QUIZ_RESULTS: 'QUIZ_RESULTS' },
    prisma: { $transaction: vi.fn(), participant: { findMany: vi.fn() } },
}));
vi.mock('../../../class/quizAction', () => ({
    default: {
        verifyCookie: vi.fn(),
        sanitizeGameSession: vi.fn((session) => session),
        sanitizeCurrentQuestion: vi.fn((question) => question),
    },
}));
vi.mock('../../../class/response_writer', () => ({
    default: { secure_success: vi.fn(), system_error: vi.fn(), not_found: vi.fn() },
}));
vi.mock('../../../controllers/chat-controller/getChatsController', () => ({
    default: vi.fn().mockResolvedValue({ messages: [] }),
}));
vi.mock('../../../services/init.services', () => ({
    redisCacheInstance: {
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
}));

const question = { id: 'question', correctAnswer: 2, explanation: 'Explanation' };
const session = {
    currentPhase: 'SHOW_RESULTS',
    hostScreen: 'QUESTION_RESULTS',
    currentQuestionId: question.id,
    phaseEndTime: null,
};
const player = { id: 'player', nickname: 'Player', avatar: null, totalScore: 100 };
const topScores = [{ ...player, rank: 1 }];
const req = {
    headers: { cookie: `${NOCTURN_COOKIE_NAME}=token` },
    params: { quizId: 'quiz' },
} as unknown as Request;
const res = {} as Response;

function restoredData() {
    expect(ResponseWriter.system_error).not.toHaveBeenCalled();
    const call = vi.mocked(ResponseWriter.secure_success).mock.calls[0];
    if (!call) throw new Error('No successful restore response');
    return (call[1] as unknown as { data: Record<string, unknown> }).data;
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(redisCacheInstance.get_live_quiz_batch).mockResolvedValue({
        gameSession: session,
        quiz: { id: 'quiz', questions: [question] },
        cachedParticipants: [player],
        cachedSpectators: [],
    } as never);
    vi.mocked(redisCacheInstance.get_host).mockResolvedValue(player as never);
    vi.mocked(redisCacheInstance.get_participant).mockResolvedValue(player as never);
    vi.mocked(redisCacheInstance.get_spectator).mockResolvedValue(player as never);
    vi.mocked(redisCacheInstance.get_participant_response).mockResolvedValue({
        selectedAnswer: 2,
        pointsEarned: 100,
    } as never);
    vi.mocked(redisCacheInstance.get_top_leaderboards).mockResolvedValue(topScores);
    vi.mocked(redisCacheInstance.get_leaderboard_count).mockResolvedValue(20);
    vi.mocked(redisCacheInstance.get_participant_rank).mockResolvedValue(15);
    vi.mocked(redisCacheInstance.get_participant_score).mockResolvedValue(100);
});

describe('live quiz restoration', () => {
    it.each([USER_TYPE.HOST, USER_TYPE.PARTICIPANT, USER_TYPE.SPECTATOR])(
        'restores results for %s, including a participant outside the top ten',
        async (role) => {
            vi.mocked(QuizAction.verifyCookie).mockReturnValue({
                role,
                userId: player.id,
                quizId: 'quiz',
                gameSessionId: 'session',
            } as never);
            await getLiveQuizDataController(req, res);
            expect(restoredData()).toMatchObject({
                gameSession: session,
                currentQuestion: question,
                leaderboard: {
                    topScores,
                    totalParticipants: 20,
                    myRank: role === USER_TYPE.PARTICIPANT ? 15 : null,
                    myScore: role === USER_TYPE.PARTICIPANT ? 100 : null,
                },
            });
            if (role === USER_TYPE.PARTICIPANT) {
                expect(restoredData().response).toMatchObject({
                    selectedAnswer: 2,
                    pointsEarned: 100,
                });
            } else {
                expect(redisCacheInstance.get_participant_rank).not.toHaveBeenCalled();
            }
        },
    );

    it('does not attach results standings during an active question', async () => {
        vi.mocked(QuizAction.verifyCookie).mockReturnValue({
            role: USER_TYPE.PARTICIPANT,
            userId: player.id,
            quizId: 'quiz',
            gameSessionId: 'session',
        } as never);
        vi.mocked(redisCacheInstance.get_live_quiz_batch).mockResolvedValue({
            gameSession: { ...session, currentPhase: 'QUESTION_ACTIVE' },
            quiz: { questions: [question] },
            cachedParticipants: [],
            cachedSpectators: [],
        } as never);
        await getLiveQuizDataController(req, res);
        expect(restoredData().leaderboard).toBeNull();
        expect(redisCacheInstance.get_top_leaderboards).not.toHaveBeenCalled();
    });

    it.each([USER_TYPE.HOST, USER_TYPE.PARTICIPANT, USER_TYPE.SPECTATOR])(
        'restores standings from the database after a cache miss for %s',
        async (role) => {
            vi.mocked(QuizAction.verifyCookie).mockReturnValue({
                role,
                userId: player.id,
                quizId: 'quiz',
                gameSessionId: 'session',
            } as never);
            vi.mocked(redisCacheInstance.get_live_quiz_batch).mockResolvedValue({} as never);
            vi.mocked(prisma.$transaction).mockResolvedValue({
                gameSession: session,
                quiz: { id: 'quiz' },
                question,
                userData: player,
                participants: [player],
                spectators: [],
                participantResponse: null,
                askedQuestionCount: 1,
            } as never);
            vi.mocked(prisma.participant.findMany).mockResolvedValue([player] as never);
            await getLiveQuizDataController(req, res);
            expect(restoredData().leaderboard).toEqual({
                topScores,
                totalParticipants: 1,
                myRank: role === USER_TYPE.PARTICIPANT ? 1 : null,
                myScore: role === USER_TYPE.PARTICIPANT ? 100 : null,
            });
            expect(prisma.participant.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { quizId: 'quiz' },
                    orderBy: [{ totalScore: 'desc' }, { id: 'desc' }],
                }),
            );
        },
    );
});
