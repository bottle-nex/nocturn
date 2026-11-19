import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { prisma } from '@nocturn/database';
import QuizAction from '../../../class/quizAction';
import getQuizController from '../../../controllers/quiz-controller/getQuizController';
import QuizController, {
    QuizControllerAction,
} from '../../../controllers/quiz-controller/quizController';
import authMiddleware from '../../../middlewares/auth.middleware';
import Subscription from '../../../middlewares/subscription.middleware';
import { buildRouteApp } from '../../helpers/app.helper';
import { bearerHeader, TEST_USER } from '../../helpers/auth.helper';

const getApp = buildRouteApp('get', '/quiz/:quizId', authMiddleware, getQuizController);
const saveApp = buildRouteApp(
    'post',
    '/quiz/:quizId',
    authMiddleware,
    QuizController.process(QuizControllerAction.SAVE),
);

describe('collaborator quiz access', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('looks up an active collaborator by user ID', async () => {
        vi.mocked(prisma.quiz.findFirst).mockResolvedValue({
            id: 'quiz',
            hostId: 'owner',
            status: 'CREATED',
            CollabSession: null,
        } as any);
        vi.spyOn(QuizAction, 'record_quiz_view').mockResolvedValue(undefined);
        await request(getApp).get('/quiz/quiz').set('Authorization', bearerHeader()).expect(200);
        expect(prisma.quiz.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: [
                        { hostId: TEST_USER.id },
                        {
                            CollabSession: {
                                collaborators: { some: { userId: TEST_USER.id, isBlocked: false } },
                            },
                        },
                    ],
                }),
            }),
        );
    });

    it('allows an active collaborator to save using the owner subscription', async () => {
        vi.mocked(prisma.quiz.findUnique).mockResolvedValue({
            id: 'quiz',
            hostId: 'owner',
            status: 'CREATED',
        } as any);
        vi.mocked(prisma.collaborator.findFirst).mockResolvedValue({ id: 'member' } as any);
        const subscription = vi
            .spyOn(Subscription, 'get_user_subscription')
            .mockResolvedValue(null);
        const update = vi.fn().mockResolvedValue({ id: 'quiz' });
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
            fn({ question: { deleteMany: vi.fn() }, quiz: { update } }),
        );
        await request(saveApp)
            .post('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .send({ title: 'Quiz', questions: [] })
            .expect(200);
        expect(prisma.collaborator.findFirst).toHaveBeenCalledWith({
            where: { userId: TEST_USER.id, isBlocked: false, session: { quizId: 'quiz' } },
        });
        expect(subscription).toHaveBeenCalledWith('owner');
        expect(update).toHaveBeenCalledOnce();
    });

    it('rejects a removed collaborator saving', async () => {
        vi.mocked(prisma.quiz.findUnique).mockResolvedValue({
            id: 'quiz',
            hostId: 'owner',
            status: 'CREATED',
        } as any);
        vi.mocked(prisma.collaborator.findFirst).mockResolvedValue(null);
        await request(saveApp)
            .post('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .send({ title: 'Quiz', questions: [] })
            .expect(403);
    });
});
