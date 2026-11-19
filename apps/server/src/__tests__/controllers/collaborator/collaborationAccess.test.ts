import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildRouteApp } from '../../helpers/app.helper';
import { bearerHeader, TEST_USER } from '../../helpers/auth.helper';
import authMiddleware from '../../../middlewares/auth.middleware';
import getQuizController from '../../../controllers/quiz-controller/getQuizController';
import getQuestionsController from '../../../controllers/quiz-controller/getQuestionsController';
import getSharedQuizController from '../../../controllers/quiz-controller/get_shared_quiz_controller';
import removeCollaboratorController from '../../../controllers/collaborator-controller/removeCollaboratorController';
import QuizController, {
    QuizControllerAction,
} from '../../../controllers/quiz-controller/quizController';

const mocks = vi.hoisted(() => ({
    findQuiz: vi.fn(),
    findAccessibleQuiz: vi.fn(),
    findQuizzes: vi.fn(),
    createQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    deleteQuestions: vi.fn(),
    findSession: vi.fn(),
    blockCollaborator: vi.fn(),
    publish: vi.fn(),
    subscription: vi.fn(),
}));

vi.mock('@nocturn/database', () => ({
    QuizStatus: { CREATED: 'CREATED' },
    prisma: {
        quiz: {
            findUnique: mocks.findQuiz,
            findFirst: mocks.findAccessibleQuiz,
            findMany: mocks.findQuizzes,
            create: mocks.createQuiz,
        },
        collabSession: { findFirst: mocks.findSession },
        collaborator: { updateMany: mocks.blockCollaborator },
        $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
            callback({
                question: { deleteMany: mocks.deleteQuestions },
                quiz: { update: mocks.updateQuiz },
            }),
    },
}));
vi.mock('../../../services/init.services', () => ({
    publisherInstance: { publish: mocks.publish },
    redisCacheInstance: {},
}));
vi.mock('../../../middlewares/subscription.middleware', () => ({
    default: { get_user_subscription: mocks.subscription },
}));
vi.mock('../../../class/quizAction', () => ({
    default: { record_quiz_view: vi.fn(), generateCollabSessionToken: () => 'session-token' },
}));

const getApp = buildRouteApp('get', '/quiz/:quizId', authMiddleware, getQuizController);
const questionsApp = buildRouteApp(
    'get',
    '/questions/:quizId',
    authMiddleware,
    getQuestionsController,
);
const sharedApp = buildRouteApp('get', '/shared', authMiddleware, getSharedQuizController);
const saveApp = buildRouteApp(
    'post',
    '/quiz/:quizId',
    authMiddleware,
    QuizController.process(QuizControllerAction.SAVE),
);
const removeApp = buildRouteApp(
    'delete',
    '/quiz/:quizId/collaborators/:userId',
    authMiddleware,
    removeCollaboratorController,
);
const quiz = {
    id: 'quiz',
    hostId: 'owner',
    status: 'CREATED',
    CollabSession: {
        id: 'session',
        collaborators: [{ user: { id: TEST_USER.id }, role: 'EDITOR' }],
    },
};
const saveData = { title: 'Shared quiz', questions: [], liveChat: true };

describe('collaboration access', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.subscription.mockResolvedValue('FREE');
        mocks.publish.mockResolvedValue(1);
    });

    it('opens an invited user’s quiz using membership userId', async () => {
        mocks.findAccessibleQuiz.mockResolvedValue(quiz);
        await request(getApp).get('/quiz/quiz').set('Authorization', bearerHeader()).expect(200);
        expect(mocks.findAccessibleQuiz).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        {
                            CollabSession: {
                                collaborators: { some: { userId: TEST_USER.id, isBlocked: false } },
                            },
                        },
                    ]),
                }),
            }),
        );
    });

    it('rejects an inaccessible quiz', async () => {
        mocks.findAccessibleQuiz.mockResolvedValue(null);
        await request(getApp).get('/quiz/quiz').set('Authorization', bearerHeader()).expect(404);
    });

    it('checks active membership when reading questions', async () => {
        mocks.findQuiz.mockResolvedValue({ id: 'quiz', questions: [] });
        await request(questionsApp)
            .get('/questions/quiz')
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(mocks.findQuiz).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        {
                            CollabSession: {
                                collaborators: { some: { userId: TEST_USER.id, isBlocked: false } },
                            },
                        },
                    ]),
                }),
            }),
        );
    });

    it('excludes blocked users from the shared quiz list', async () => {
        mocks.findQuizzes.mockResolvedValue([]);
        await request(sharedApp).get('/shared').set('Authorization', bearerHeader()).expect(200);
        expect(mocks.findQuizzes).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    CollabSession: {
                        collaborators: { some: { userId: TEST_USER.id, isBlocked: false } },
                    },
                }),
            }),
        );
    });

    it('lets an active collaborator save using the owner’s subscription', async () => {
        mocks.findQuiz.mockResolvedValue(quiz);
        mocks.findAccessibleQuiz.mockResolvedValue({ id: 'quiz' });
        mocks.updateQuiz.mockResolvedValue(quiz);
        await request(saveApp)
            .post('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .send(saveData)
            .expect(200);
        expect(mocks.subscription).toHaveBeenCalledWith('owner');
        expect(mocks.updateQuiz).toHaveBeenCalledOnce();
    });

    it('does not save a removed user’s snapshot', async () => {
        mocks.findQuiz.mockResolvedValue(quiz);
        mocks.findAccessibleQuiz.mockResolvedValue(null);
        await request(saveApp)
            .post('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .send(saveData)
            .expect(401);
        expect(mocks.updateQuiz).not.toHaveBeenCalled();
        expect(mocks.deleteQuestions).not.toHaveBeenCalled();
    });

    it('creates a new quiz without sending an owner-validation error first', async () => {
        mocks.findQuiz.mockResolvedValue(null);
        mocks.createQuiz.mockResolvedValue(quiz);
        await request(saveApp)
            .post('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .send(saveData)
            .expect(201);
        expect(mocks.findAccessibleQuiz).not.toHaveBeenCalled();
    });

    it('blocks a collaborator and publishes revocation to every server', async () => {
        mocks.findSession.mockResolvedValue({ id: 'session', hostId: TEST_USER.id });
        await request(removeApp)
            .delete('/quiz/quiz/collaborators/member')
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(mocks.findSession).toHaveBeenCalledWith({
            where: { quizId: 'quiz', hostId: TEST_USER.id },
            select: { id: true, hostId: true },
        });
        expect(mocks.blockCollaborator).toHaveBeenCalledWith({
            where: { sessionId: 'session', userId: 'member' },
            data: { isBlocked: true },
        });
        expect(mocks.publish).toHaveBeenCalledWith(
            'collab_session:session',
            JSON.stringify({ type: 'COLLABORATOR_REMOVED', payload: { userId: 'member' } }),
        );
    });

    it('does not let a non-owner remove members', async () => {
        mocks.findSession.mockResolvedValue(null);
        await request(removeApp)
            .delete('/quiz/quiz/collaborators/member')
            .set('Authorization', bearerHeader())
            .expect(401);
        expect(mocks.blockCollaborator).not.toHaveBeenCalled();
    });

    it('does not let the owner remove themselves', async () => {
        mocks.findSession.mockResolvedValue({ id: 'session', hostId: TEST_USER.id });
        await request(removeApp)
            .delete(`/quiz/quiz/collaborators/${TEST_USER.id}`)
            .set('Authorization', bearerHeader())
            .expect(401);
        expect(mocks.blockCollaborator).not.toHaveBeenCalled();
    });
});
