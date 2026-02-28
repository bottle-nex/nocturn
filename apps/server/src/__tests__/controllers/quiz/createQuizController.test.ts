import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { prisma } from '@nocturn/database';
import { buildTestApp } from '../../helpers/app.helper.ts';
import { bearerHeader, TEST_USER } from '../../helpers/auth.helper.ts';
import quizRouter from '../../../routes/quiz.router.ts';
import type { CustomResponse } from '@nocturn/types';

// ---------------------------------------------------------------------------
// Test app: minimal Express instance with the quiz router only.
//   - authMiddleware is real (verifies actual JWTs against SERVER_JWT_SECRET)
//   - prisma is mocked globally via test.setup.ts
//   - No WebSocket, Redis, Bull queues, or cron
// ---------------------------------------------------------------------------
const app = buildTestApp(quizRouter);

const mockPrismaQuizCreate = vi.mocked(prisma.quiz.create);

// Stable fixture that mirrors what Prisma returns for a newly created quiz.
// Using a fixed object avoids asserting on random values from getRandomSampleQuiz().
const MOCK_QUIZ = {
    id: 'quiz-id-abc123',
    title: 'Solar System Trivia',
    templateId: 'CLASSIC',
    prizePool: 0,
    currency: 'SOL',
    hostId: TEST_USER.id,
    createdAt: new Date('2026-02-28T00:00:00.000Z'),
    updatedAt: new Date('2026-02-28T00:00:00.000Z'),
    questions: [
        {
            id: 'question-id-1',
            question: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correctAnswer: 1,
            difficulty: 1,
            basePoints: 100,
            timeLimit: 30,
            readingTime: 4,
            orderIndex: 0,
            hintLaunched: false,
        },
    ],
    template: { id: 'CLASSIC', name: 'Classic' },
};

describe('createQuizController', () => {
    beforeEach(() => {
        // Reset call history and return values before each test to prevent
        // cross-test pollution. Does NOT reset the mock implementation
        // registered in test.setup.ts.
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    // Happy path
    // -----------------------------------------------------------------------
    it('should return 201 with the created quiz when the user is authenticated', async () => {
        mockPrismaQuizCreate.mockResolvedValueOnce(MOCK_QUIZ as any);

        const response = await request(app)
            .post('/api/v1/quiz/create-quiz')
            .set('Authorization', bearerHeader())
            .expect(201);

        const body = response.body as CustomResponse<typeof MOCK_QUIZ>;

        expect(body.success).toBe(true);
        expect(body.data?.id).toBe(MOCK_QUIZ.id);
        expect(body.data?.hostId).toBe(TEST_USER.id);
        expect(body.data?.questions).toHaveLength(1);
        expect(body.meta?.timestamp).toBeDefined();

        // Verify Prisma was called exactly once with the authenticated user's id
        expect(mockPrismaQuizCreate).toHaveBeenCalledOnce();
        expect(mockPrismaQuizCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    hostId: TEST_USER.id,
                    prizePool: 0,
                    currency: 'SOL',
                }),
            }),
        );
    });

    // -----------------------------------------------------------------------
    // Auth guard — no Authorization header
    // -----------------------------------------------------------------------
    it('should return 401 when no Authorization header is provided', async () => {
        const response = await request(app).post('/api/v1/quiz/create-quiz').expect(401);

        // authMiddleware returns its own message shape (not CustomResponse)
        expect(response.body.message).toBe('Unauthorized: No token provided');

        // Prisma must never be reached on an unauthenticated request
        expect(mockPrismaQuizCreate).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------
    // Auth guard — malformed / invalid token
    // -----------------------------------------------------------------------
    it('should return 401 when an invalid Bearer token is provided', async () => {
        const response = await request(app)
            .post('/api/v1/quiz/create-quiz')
            .set('Authorization', 'Bearer this.is.not.a.valid.jwt')
            .expect(401);

        expect(response.body.message).toBe('Not authorized');
        expect(mockPrismaQuizCreate).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------
    // Prisma failure — 500 internal server error
    // -----------------------------------------------------------------------
    it('should return 500 when prisma.quiz.create throws', async () => {
        mockPrismaQuizCreate.mockRejectedValueOnce(new Error('DB connection refused'));

        const response = await request(app)
            .post('/api/v1/quiz/create-quiz')
            .set('Authorization', bearerHeader())
            .expect(500);

        const body = response.body as CustomResponse;

        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('INTERNAL_SERVER_ERROR');
        expect(body.meta?.timestamp).toBeDefined();
    });

    // -----------------------------------------------------------------------
    // JWT userId flows through to Prisma as hostId
    // -----------------------------------------------------------------------
    it('should use the userId from the JWT as the quiz hostId', async () => {
        const customUser = { id: 'custom-user-999', email: 'custom@nocturn.app', name: 'Custom' };
        mockPrismaQuizCreate.mockResolvedValueOnce({
            ...MOCK_QUIZ,
            hostId: customUser.id,
        } as any);

        await request(app)
            .post('/api/v1/quiz/create-quiz')
            .set('Authorization', bearerHeader(customUser))
            .expect(201);

        expect(mockPrismaQuizCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ hostId: customUser.id }),
            }),
        );
    });
});
