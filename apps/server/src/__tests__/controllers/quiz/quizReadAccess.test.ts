import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { prisma, type Quiz } from '@nocturn/database';
import { CollabRole, NOCTURN_COOKIE_NAME, QuizResponseType } from '@nocturn/types';
import { buildTestApp } from '../../helpers/app.helper.ts';
import { bearerHeader, TEST_USER } from '../../helpers/auth.helper.ts';
import quizRouter from '../../../routes/quiz.router.ts';
import QuizAction from '../../../class/quizAction';

const app = buildTestApp(quizRouter);
const mockFindFirst = vi.mocked(prisma.quiz.findFirst);
const mockFindUnique = vi.mocked(prisma.quiz.findUnique);
const mockFindMany = vi.mocked(prisma.quiz.findMany);
const ownerId = 'quiz-owner';
const quizId = 'shared-quiz';
const date = new Date('2026-02-28T00:00:00.000Z');
const questions = [
    { question: 'First question', options: ['A', 'B'], orderIndex: 0 },
    { question: 'Second question', options: ['C', 'D'], orderIndex: 1 },
];
const quiz = {
    id: quizId,
    title: 'Shared quiz',
    description: null,
    templateId: 'CLASSIC',
    participantCode: null,
    spectatorCode: null,
    spectatorLink: null,
    isFavourite: false,
    prizePool: 0,
    currency: 'NONE',
    basePointsPerQuestion: 100,
    pointsMultiplier: 'NONE',
    pointsIncrement: 1,
    batchSize: 3,
    timeBonus: true,
    eliminationThreshold: 0.5,
    questionTimeLimit: 30,
    breakBetweenQuestions: 5,
    status: 'CREATED',
    interactions: [],
    isDeleted: false,
    deletedAt: null,
    createdAt: date,
    updatedAt: date,
    scheduledAt: null,
    startedAt: null,
    endedAt: null,
    hostId: ownerId,
    autoSave: true,
    liveChat: false,
    spectatorMode: false,
    allowNewSpectator: true,
    escrowPda: null,
    quizAccountPda: null,
    onChainTxSignature: null,
    hostWalletPubkey: null,
} satisfies Quiz;

function editorQuiz(role: CollabRole = CollabRole.EDITOR) {
    return {
        ...quiz,
        template: { id: 'CLASSIC', name: 'Classic' },
        questions,
        prizeDistributions: [],
        CollabSession: {
            id: 'collaboration-session',
            quizId,
            hostId: ownerId,
            createdAt: date,
            updatedAt: date,
            collaborators: [
                {
                    id: 'membership-id-different-from-account-id',
                    userId: TEST_USER.id,
                    isBlocked: false,
                    role,
                    user: {
                        id: TEST_USER.id,
                        name: TEST_USER.name,
                        email: TEST_USER.email,
                        image: null,
                    },
                },
            ],
        },
    };
}

function accessWhere(userId: string) {
    return {
        id: quizId,
        OR: [
            { hostId: userId },
            { CollabSession: { collaborators: { some: { userId, isBlocked: false } } } },
        ],
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockReset();
    mockFindUnique.mockReset();
    mockFindMany.mockReset();
    vi.spyOn(QuizAction, 'record_quiz_view').mockResolvedValue({ created: true });
});

const readEndpoints = [
    { path: `/api/v1/quiz/get-quiz/${quizId}`, mock: mockFindFirst, editor: true },
    { path: `/api/v1/quiz/get-quiz-questions/${quizId}`, mock: mockFindUnique, editor: false },
];

describe.each(readEndpoints)('$path', ({ path, mock, editor }) => {
    it.each([CollabRole.EDITOR, CollabRole.VIEWER])(
        'returns all questions for an active %s',
        async (role) => {
            const fixture = editorQuiz(role);
            mock.mockResolvedValueOnce(fixture);
            const response = await request(app)
                .get(path)
                .set('Authorization', bearerHeader())
                .expect(200);

            expect(mock).toHaveBeenCalledWith(
                expect.objectContaining({ where: accessWhere(TEST_USER.id) }),
            );
            expect(response.body.success).toBe(true);
            expect(
                editor ? response.body.data.quiz.questions : response.body.data.questions,
            ).toEqual(questions);
            if (editor) {
                expect(mock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        include: expect.objectContaining({ questions: true }),
                    }),
                );
                expect(response.body.data.type).toBe(QuizResponseType.QUIZ_FOUND);
                const cookie = response.headers['set-cookie']?.[0];
                expect(cookie).toContain(`${NOCTURN_COOKIE_NAME}=`);
                const token = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
                expect(QuizAction.verifyCookie(token)).toMatchObject({
                    userId: TEST_USER.id,
                    quizId,
                    role,
                    collabSessionId: fixture.CollabSession.id,
                });
            } else {
                expect(mock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        select: expect.objectContaining({
                            questions: {
                                select: { question: true, options: true, orderIndex: true },
                            },
                        }),
                    }),
                );
            }
        },
    );

    it('retains owner access without a collaborator row', async () => {
        const fixture = { ...editorQuiz(), CollabSession: null };
        mock.mockResolvedValueOnce(fixture);
        await request(app)
            .get(path)
            .set('Authorization', bearerHeader({ id: ownerId }))
            .expect(200);
        expect(mock).toHaveBeenCalledWith(expect.objectContaining({ where: accessWhere(ownerId) }));
    });

    it.each([
        'stranger',
        'blocked collaborator',
        'removed collaborator',
        'pending invite',
        'missing quiz',
    ])('returns not found for a %s', async () => {
        mock.mockResolvedValueOnce(null);
        const response = await request(app)
            .get(path)
            .set('Authorization', bearerHeader())
            .expect(404);
        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({ where: accessWhere(TEST_USER.id) }),
        );
        expect(response.body.data?.quiz).toBeUndefined();
        expect(response.headers['set-cookie']).toBeUndefined();
        expect(QuizAction.record_quiz_view).not.toHaveBeenCalled();
    });

    it('rejects unauthenticated requests before querying', async () => {
        await request(app).get(path).expect(401);
        expect(mock).not.toHaveBeenCalled();
    });

    it('returns a system error when the database fails', async () => {
        mock.mockRejectedValueOnce(new Error('Database unavailable'));
        await request(app).get(path).set('Authorization', bearerHeader()).expect(500);
    });
});

describe('editor session behavior', () => {
    it('issues the owner a HOST cookie even without an owner membership', async () => {
        mockFindFirst.mockResolvedValueOnce(editorQuiz());
        const response = await request(app)
            .get(readEndpoints[0].path)
            .set('Authorization', bearerHeader({ id: ownerId }))
            .expect(200);
        const cookie = response.headers['set-cookie'][0];
        const token = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
        expect(QuizAction.verifyCookie(token)).toMatchObject({
            userId: ownerId,
            role: CollabRole.HOST,
        });
    });

    it('keeps the live quiz redirect', async () => {
        mockFindFirst.mockResolvedValueOnce({ ...editorQuiz(), status: 'LIVE' });
        const response = await request(app)
            .get(readEndpoints[0].path)
            .set('Authorization', bearerHeader())
            .expect(302);
        expect(response.body.url).toBe('/home');
        expect(response.headers['set-cookie']).toBeUndefined();
    });
});

const listEndpoints = [
    { path: '/api/v1/quiz/get-user-quiz', sharedOnly: false },
    { path: '/api/v1/quiz/get-shared-quiz', sharedOnly: true },
];

describe.each(listEndpoints)('$path', ({ path, sharedOnly }) => {
    function expectListAccess() {
        const membership = {
            CollabSession: { collaborators: { some: { userId: TEST_USER.id, isBlocked: false } } },
        };
        expect(mockFindMany).toHaveBeenCalledOnce();
        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: sharedOnly
                    ? { ...membership, isDeleted: false }
                    : { OR: [{ hostId: TEST_USER.id }, membership], isDeleted: false },
            }),
        );
        if (sharedOnly) {
            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    select: expect.objectContaining({
                        CollabSession: {
                            select: {
                                collaborators: {
                                    where: { userId: TEST_USER.id, isBlocked: false },
                                    select: { role: true, joinedAt: true },
                                },
                            },
                        },
                    }),
                }),
            );
        } else {
            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                }),
            );
        }
    }

    it('lists accessible quizzes with an owner appearing only once', async () => {
        const ownedQuiz = { ...quiz, id: 'owned-quiz', hostId: TEST_USER.id };
        const fixtures = sharedOnly ? [quiz] : [ownedQuiz, quiz];
        mockFindMany.mockResolvedValueOnce(fixtures);
        const response = await request(app)
            .get(path)
            .set('Authorization', bearerHeader())
            .expect(200);
        expectListAccess();
        expect(response.body.success).toBe(true);
        expect(response.body.data.map((item: Quiz) => item.id)).toEqual(
            fixtures.map((item) => item.id),
        );
    });

    it('returns an empty list when no memberships or owned quizzes qualify', async () => {
        mockFindMany.mockResolvedValueOnce([]);
        const response = await request(app)
            .get(path)
            .set('Authorization', bearerHeader())
            .expect(200);
        expectListAccess();
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
    });

    it('rejects unauthenticated requests before querying', async () => {
        await request(app).get(path).expect(401);
        expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('returns a system error when the database fails', async () => {
        mockFindMany.mockRejectedValueOnce(new Error('Database unavailable'));
        await request(app).get(path).set('Authorization', bearerHeader()).expect(500);
    });
});
