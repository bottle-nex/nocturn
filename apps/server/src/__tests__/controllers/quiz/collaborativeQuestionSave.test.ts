import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'express';
import request from 'supertest';
import { SubscriptionEnum } from '@nocturn/types';
import QuizController, {
    QuizControllerAction,
} from '../../../controllers/quiz-controller/quizController';
import { buildTestApp } from '../../helpers/app.helper';

const mocks = vi.hoisted(() => ({
    findQuiz: vi.fn(),
    findSession: vi.fn(),
    readQuestions: vi.fn(),
    deleteQuestions: vi.fn(),
    updateQuiz: vi.fn(),
    transaction: vi.fn(),
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        quiz: { findUnique: mocks.findQuiz },
        user: { findUnique: vi.fn().mockResolvedValue(null) },
        collabSession: { findUnique: mocks.findSession },
        $transaction: mocks.transaction,
    },
}));
vi.mock('../../../services/init.services', () => ({
    redisCacheInstance: {},
    collabStateCacheInstance: { get_all_questions: mocks.readQuestions },
}));

const question = {
    id: 'question-1',
    question: 'Stale browser text',
    options: ['One', 'Two'],
    correctAnswer: 0,
    explanation: '',
    hint: '',
    difficulty: 1,
    basePoints: 100,
    timeLimit: 30,
    readingTime: 5,
    orderIndex: 0,
    hintLaunched: false,
};
const router = Router();
router.post(
    '/save/:quizId',
    (req, res, next) => {
        req.user = {
            id: 'host',
            email: 'host@example.com',
            name: 'Host',
            subscription: SubscriptionEnum.FREE,
        };
        next();
    },
    QuizController.process(QuizControllerAction.SAVE),
);
const app = buildTestApp(router);

describe('saving collaborative questions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.findQuiz.mockResolvedValue({ id: 'quiz-1', status: 'CREATED' });
        mocks.findSession.mockResolvedValue({ id: 'session-1' });
        mocks.readQuestions.mockResolvedValue([
            { ...question, question: 'Merged live text', options: ['One', 'Merged answer'] },
        ]);
        mocks.updateQuiz.mockResolvedValue({ id: 'quiz-1' });
        mocks.transaction.mockImplementation(async (callback) =>
            callback({
                question: { deleteMany: mocks.deleteQuestions },
                quiz: { update: mocks.updateQuiz },
            }),
        );
    });

    it('persists the accepted live fields and keeps the stable question ID', async () => {
        const response = await request(app)
            .post('/api/v1/save/quiz-1')
            .send({ title: 'Quiz', questions: [question] });
        expect(response.status).toBe(200);
        expect(mocks.readQuestions).toHaveBeenCalledWith('session-1', 'quiz-1');
        expect(mocks.updateQuiz).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    questions: {
                        create: [
                            {
                                ...question,
                                question: 'Merged live text',
                                options: ['One', 'Merged answer'],
                            },
                        ],
                    },
                }),
            }),
        );
    });

    it('keeps normal saves working when the quiz has no collaboration session', async () => {
        mocks.findSession.mockResolvedValue(null);
        const response = await request(app)
            .post('/api/v1/save/quiz-1')
            .send({ title: 'Quiz', questions: [question] });
        expect(response.status).toBe(200);
        expect(mocks.readQuestions).not.toHaveBeenCalled();
        expect(mocks.updateQuiz).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ questions: { create: [question] } }),
            }),
        );
    });

    it('reports a failed save instead of overwriting live edits when Redis is unavailable', async () => {
        mocks.readQuestions.mockRejectedValueOnce(new Error('Redis unavailable'));
        const response = await request(app)
            .post('/api/v1/save/quiz-1')
            .send({ title: 'Quiz', questions: [question] });
        expect(response.status).toBe(500);
        expect(mocks.transaction).not.toHaveBeenCalled();
    });
});
