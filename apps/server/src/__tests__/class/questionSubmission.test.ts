import { beforeEach, describe, expect, it, vi } from 'vitest';
import ParticipantManager from '../../sockets/ParticipantManager';
import { QuestionDefinition } from '@nocturn/types';

const db = vi.hoisted(() => ({
    create: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
    findResponse: vi.fn(),
}));
vi.mock('@nocturn/database', () => ({
    prisma: { $transaction: db.transaction, response: { findUnique: db.findResponse } },
    QuizPhase: { QUESTION_ACTIVE: 'QUESTION_ACTIVE' },
}));

describe('live question submission', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        db.findResponse.mockResolvedValue(null);
        db.create.mockImplementation(async ({ data }) => ({ id: 'response', ...data }));
        db.update.mockImplementation(async ({ data }) => ({
            id: 'player',
            totalScore: 200 + data.totalScore.increment,
        }));
        db.transaction.mockImplementation(async (fn) =>
            fn({ response: { create: db.create }, participant: { update: db.update } }),
        );
    });

    function game(question: QuestionDefinition) {
        const cache = {
            get_game_session: vi.fn().mockResolvedValue({
                currentQuestionId: 'question',
                currentPhase: 'QUESTION_ACTIVE',
                phaseStartTime: new Date(Date.now() - 15000),
                phaseEndTime: new Date(Date.now() + 15000),
            }),
            get_participant_response: vi.fn().mockResolvedValue(null),
            get_quiz: vi.fn().mockResolvedValue({
                timeBonus: true,
                questions: [{ id: 'question', basePoints: 100, timeLimit: 30, ...question }],
            }),
            get_participant: vi.fn().mockResolvedValue({
                id: 'player',
                currentStreak: 0,
                longestStreak: 0,
                totalScore: 200,
            }),
            set_participant_response: vi.fn(),
            set_participant: vi.fn(),
            set_leaderboard_score: vi.fn(),
        };
        // Exercise the socket handler without opening real Redis/WebSocket connections.
        const manager = Object.assign(
            Object.create(ParticipantManager.prototype) as {
                handle_participant_response: (payload: unknown, socket: unknown) => Promise<void>;
            },
            { redis_cache: cache, quizManager: { publish_event_to_redis: vi.fn() } },
        );
        const socket = { user: { userId: 'player', gameSessionId: 'session' }, send: vi.fn() };
        return {
            cache,
            socket,
            submit: (answer: unknown, questionId = 'question') =>
                manager.handle_participant_response({ answer, questionId }, socket),
        };
    }

    it.each([
        [{ options: ['A', 'B'], correctAnswer: 1 }, 1, 135],
        [{ questionType: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 0 }, 0, 135],
        [
            {
                questionType: 'MULTI_SELECT',
                options: ['A', 'B', 'C'],
                correctAnswer: 0,
                answerConfig: { correctIndices: [0, 2] },
            },
            [2, 0],
            135,
        ],
        [
            {
                questionType: 'SHORT_ANSWER',
                options: [],
                correctAnswer: 0,
                answerConfig: { acceptedAnswers: ['New York'] },
            },
            ' NEW  YORK ',
            135,
        ],
        [
            {
                questionType: 'ORDERING',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0,
                answerConfig: { correctOrder: [0, 1, 2, 3] },
            },
            [0, 1, 3, 2],
            63,
        ],
        [
            {
                questionType: 'NUMERIC',
                options: [],
                correctAnswer: 0,
                answerConfig: { min: 0, max: 100, target: 50, tolerance: 20 },
            },
            55,
            94,
        ],
    ] as [QuestionDefinition, unknown, number][])(
        'persists typed answer and weighted points for %j',
        async (question, answer, points) => {
            const { cache, socket, submit } = game(question);
            await submit(answer);
            expect(db.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ answer, pointsEarned: points }),
            });
            expect(db.update).toHaveBeenCalledWith({
                where: { id: 'player' },
                data: expect.objectContaining({ totalScore: { increment: points } }),
            });
            expect(cache.set_participant_response).toHaveBeenCalledWith(
                'session',
                'question',
                'player',
                expect.objectContaining({ answer }),
            );
            expect(cache.set_leaderboard_score).toHaveBeenCalledWith(
                'session',
                'player',
                200 + points,
            );
            const ack = JSON.parse(socket.send.mock.calls[0]![0]).payload.response;
            expect(ack.answer).toEqual(answer);
            expect(ack).not.toHaveProperty('isCorrect');
            expect(ack).not.toHaveProperty('pointsEarned');
        },
    );
    it('keeps a previous answer on reconnect and does not score it twice', async () => {
        const { cache, socket, submit } = game({ options: ['A', 'B'], correctAnswer: 0 });
        cache.get_participant_response.mockResolvedValue({ answer: 1, selectedAnswer: 1 });
        await submit(0);
        expect(db.transaction).not.toHaveBeenCalled();
        expect(JSON.parse(socket.send.mock.calls[0]![0]).payload.response.answer).toBe(1);
    });
    it.each([0, 1, [0, 2], 'New York', [2, 0, 1], 12.5].map((answer) => ({ answer })))(
        'restores a persisted answer $answer when Redis misses, even after the deadline',
        async ({ answer }) => {
            const { cache, socket, submit } = game({ options: ['A', 'B'], correctAnswer: 0 });
            cache.get_game_session.mockResolvedValue({
                currentQuestionId: 'question',
                currentPhase: 'SHOW_RESULTS',
                phaseEndTime: new Date(Date.now() - 1000),
            });
            db.findResponse.mockResolvedValue({
                answer,
                selectedAnswer: -1,
                isCorrect: true,
                pointsEarned: 100,
            });
            await submit('a different answer');
            expect(db.findResponse).toHaveBeenCalledWith({
                where: {
                    participantId_questionId: { participantId: 'player', questionId: 'question' },
                },
            });
            expect(db.transaction).not.toHaveBeenCalled();
            expect(JSON.parse(socket.send.mock.calls[0]![0]).payload.response).toEqual({
                answer,
                selectedAnswer: -1,
                questionId: 'question',
                participantId: 'player',
            });
        },
    );
    it('acknowledges the winning answer if a concurrent duplicate loses the database constraint', async () => {
        const { cache, socket, submit } = game({ options: ['A', 'B'], correctAnswer: 0 });
        db.findResponse.mockResolvedValueOnce(null).mockResolvedValueOnce({
            answer: 1,
            selectedAnswer: 1,
        });
        db.transaction.mockRejectedValue({ code: 'P2002' });
        await submit(0);
        expect(cache.set_leaderboard_score).not.toHaveBeenCalled();
        expect(JSON.parse(socket.send.mock.calls[0]![0]).payload.response.answer).toBe(1);
    });
    it('ignores a stale question submission before reading or acknowledging another answer', async () => {
        const { cache, socket, submit } = game({ options: ['A', 'B'], correctAnswer: 0 });
        await submit(0, 'previous-question');
        expect(cache.get_participant_response).not.toHaveBeenCalled();
        expect(db.findResponse).not.toHaveBeenCalled();
        expect(db.transaction).not.toHaveBeenCalled();
        expect(socket.send).not.toHaveBeenCalled();
    });
    it('rejects expired questions, eliminated players, and malformed answers', async () => {
        const { cache, submit } = game({ options: ['A', 'B'], correctAnswer: 0 });
        await submit([0]);
        cache.get_participant.mockResolvedValue({ isEliminated: true });
        await submit(0);
        cache.get_game_session.mockResolvedValue({ currentPhase: 'SHOW_RESULTS' });
        await submit(0);
        expect(db.transaction).not.toHaveBeenCalled();
    });
});
