import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { SubscriptionEnum } from '@nocturn/types';
import QuizController, {
    QuizControllerAction,
} from '../../../controllers/quiz-controller/quizController';
import duplicateQuizController from '../../../controllers/quiz-controller/duplicateQuizController';
import QuizAction from '../../../class/quizAction';
import Subscription from '../../../middlewares/subscription.middleware';

const db = vi.hoisted(() => ({
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteQuestions: vi.fn(),
    transaction: vi.fn(),
}));

vi.mock('@nocturn/database', () => ({
    prisma: {
        quiz: { findUnique: db.findUnique, create: db.create },
        $transaction: db.transaction,
    },
    QuizStatus: {
        CREATED: 'CREATED',
        LIVE: 'LIVE',
        PUBLISHED: 'PUBLISHED',
        COMPLETED: 'COMPLETED',
        PAYOUT_PENDING: 'PAYOUT_PENDING',
        PAYOUT_COMPLETED: 'PAYOUT_COMPLETED',
    },
    TemplateEnum: { CLASSIC: 'CLASSIC' },
}));

const question = {
    question: 'The Earth orbits the Sun.',
    format: 'TRUE_FALSE',
    options: ['True', 'False'],
    correctAnswer: 1,
    difficulty: 1,
    basePoints: 100,
    timeLimit: 30,
    readingTime: 7,
    orderIndex: 0,
    hintLaunched: false,
};
const quiz = {
    id: 'quiz-1',
    title: 'Science',
    hostId: 'host-1',
    status: 'CREATED',
    questions: [question],
};
const app = express();
app.use(express.json());
app.use((req, _res, next) => {
    req.user = {
        id: 'host-1',
        name: 'Host',
        email: 'host@example.com',
        subscription: SubscriptionEnum.FREE,
    };
    next();
});
app.post('/save/:quizId', QuizController.process(QuizControllerAction.SAVE));
app.post('/duplicate/:quizId', duplicateQuizController);

describe('question format persistence', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(QuizAction, 'validOwner').mockResolvedValue(true);
        vi.spyOn(Subscription, 'get_user_subscription').mockResolvedValue(SubscriptionEnum.FREE);
    });

    it('saves the format, fixed options and correct answer to Prisma', async () => {
        db.findUnique.mockResolvedValue(null);
        db.create.mockResolvedValue(quiz);
        const response = await request(app)
            .post('/save/quiz-1')
            .send({ title: 'Science', questions: [question] })
            .expect(201);
        expect(db.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    questions: { create: [expect.objectContaining(question)] },
                }),
            }),
        );
        expect(response.body.data.quiz.questions[0]).toMatchObject(question);
    });

    it('preserves formats when updating a mixed quiz', async () => {
        const multipleChoice = {
            ...question,
            format: 'MULTIPLE_CHOICE',
            options: ['One', 'Two', 'Three'],
            correctAnswer: 2,
            orderIndex: 1,
        };
        db.findUnique.mockResolvedValue(quiz);
        db.update.mockResolvedValue({ ...quiz, questions: [question, multipleChoice] });
        db.transaction.mockImplementation(async (callback) =>
            callback({
                question: { deleteMany: db.deleteQuestions },
                quiz: { update: db.update },
            }),
        );
        await request(app)
            .post('/save/quiz-1')
            .send({ title: 'Science', questions: [question, multipleChoice] })
            .expect(200);
        expect(db.deleteQuestions).toHaveBeenCalledWith({ where: { quizId: 'quiz-1' } });
        expect(db.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    questions: {
                        create: [
                            expect.objectContaining(question),
                            expect.objectContaining(multipleChoice),
                        ],
                    },
                }),
            }),
        );
    });

    it('rejects malformed true/false questions before writing', async () => {
        await request(app)
            .post('/save/quiz-1')
            .send({ title: 'Science', questions: [{ ...question, options: ['Yes', 'No'] }] })
            .expect(400);
        expect(db.create).not.toHaveBeenCalled();
        expect(db.transaction).not.toHaveBeenCalled();
    });

    it('keeps true/false format when duplicating a quiz', async () => {
        db.findUnique.mockResolvedValue(quiz);
        db.create.mockResolvedValue(quiz);
        await request(app).post('/duplicate/quiz-1').expect(200);
        expect(db.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    questions: {
                        create: [
                            expect.objectContaining({
                                format: 'TRUE_FALSE',
                                options: ['True', 'False'],
                                correctAnswer: 1,
                            }),
                        ],
                    },
                }),
            }),
        );
    });
});
