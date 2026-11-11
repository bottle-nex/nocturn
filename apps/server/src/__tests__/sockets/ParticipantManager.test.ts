import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';
import ParticipantManager from '../../sockets/ParticipantManager';

vi.mock('@nocturn/database', () => ({
    prisma: {},
    QuizPhase: { QUESTION_ACTIVE: 'QUESTION_ACTIVE' },
}));

describe('ParticipantManager answer validation', () => {
    const question = {
        id: 'question',
        options: ['First', 'Second', 'Third'],
        correctAnswer: 0,
        timeLimit: 30,
        basePoints: 100,
    };
    const redis_cache = {
        get_game_session: vi.fn(),
        get_participant_response: vi.fn(),
        get_quiz: vi.fn(),
        get_participant: vi.fn(),
        update_leaderboard_score: vi.fn(),
    };
    const database_queue = {
        create_participant_response: vi.fn(),
        update_participant: vi.fn(),
    };
    const quizManager = { publish_event_to_redis: vi.fn() };
    const ws = Object.assign(new WebSocket(null, undefined, {}), {
        id: 'socket',
        user: {
            userId: 'participant',
            gameSessionId: 'session',
            quizId: 'quiz',
            role: undefined,
            name: 'Player',
            tokenId: 'token',
            iat: 0,
            exp: 0,
        },
    });

    const respond = (selectedAnswer: unknown) =>
        ParticipantManager.prototype['handle_participant_response'].call(
            { redis_cache, database_queue, quizManager },
            { selectedAnswer },
            ws,
        );

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
        redis_cache.get_game_session.mockResolvedValue({
            currentPhase: 'QUESTION_ACTIVE',
            currentQuestionId: question.id,
            phaseStartTime: new Date(Date.now() - 1000),
            phaseEndTime: new Date(Date.now() + 30000),
        });
        redis_cache.get_participant_response.mockResolvedValue(null);
        redis_cache.get_quiz.mockResolvedValue({ questions: [question] });
        redis_cache.get_participant.mockResolvedValue({ currentStreak: 2 });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([-1, 3, 9, 1.5, NaN, Infinity, -Infinity, '1', null, undefined])(
        'rejects invalid selected answer %s without changing game state',
        async (selectedAnswer) => {
            await respond(selectedAnswer);

            expect(database_queue.create_participant_response).not.toHaveBeenCalled();
            expect(database_queue.update_participant).not.toHaveBeenCalled();
            expect(redis_cache.update_leaderboard_score).not.toHaveBeenCalled();
            expect(quizManager.publish_event_to_redis).not.toHaveBeenCalled();
        },
    );

    it('rejects an answer when the question has no options', async () => {
        redis_cache.get_quiz.mockResolvedValue({ questions: [{ ...question, options: [] }] });

        await respond(0);

        expect(database_queue.create_participant_response).not.toHaveBeenCalled();
        expect(database_queue.update_participant).not.toHaveBeenCalled();
        expect(redis_cache.update_leaderboard_score).not.toHaveBeenCalled();
        expect(quizManager.publish_event_to_redis).not.toHaveBeenCalled();
    });

    it.each([0, 1, 2])('accepts existing option %i', async (selectedAnswer) => {
        await respond(selectedAnswer);

        expect(database_queue.create_participant_response).toHaveBeenCalledWith(
            'participant',
            'session',
            expect.objectContaining({
                selectedAnswer,
                isCorrect: selectedAnswer === question.correctAnswer,
                questionId: question.id,
            }),
        );
        expect(database_queue.update_participant).toHaveBeenCalledOnce();
        expect(redis_cache.update_leaderboard_score).toHaveBeenCalledOnce();
        expect(quizManager.publish_event_to_redis).toHaveBeenCalledOnce();
    });
});
