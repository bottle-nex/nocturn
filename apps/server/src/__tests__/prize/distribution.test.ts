import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildRouteApp } from '../helpers/app.helper';
import { bearerHeader, TEST_USER } from '../helpers/auth.helper';
import authMiddleware from '../../middlewares/auth.middleware';
import setDistributionController from '../../controllers/prize-controller/setDistributionController';
import getQuizController from '../../controllers/quiz-controller/getQuizController';
import GetLivePrizePoolController from '../../controllers/live-quiz-controller/getLivePrizePoolController';
import { NOCTURN_COOKIE_NAME } from '@nocturn/types';

const db = vi.hoisted(() => ({
    quiz: { findFirst: vi.fn(), findUnique: vi.fn() },
    prizeDistribution: { deleteMany: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
}));
vi.mock('../../configs/env', () => ({
    env: {
        SERVER_JWT_SECRET: process.env.SERVER_JWT_SECRET,
        SERVER_JWT_REFRESH_SECRET: process.env.SERVER_JWT_REFRESH_SECRET,
        SERVER_NODE_ENV: 'test',
    },
}));
vi.mock('@nocturn/database', () => ({ prisma: db, QuizStatus: { LIVE: 'LIVE' } }));
vi.mock('../../class/quizAction', () => ({
    default: {
        record_quiz_view: vi.fn(),
        verifyCookie: vi.fn((token: string) =>
            token === 'valid' ? { quizId: 'quiz', role: 'HOST' } : null,
        ),
    },
}));

const saveApp = buildRouteApp(
    'post',
    '/distribution/:quizId',
    authMiddleware,
    setDistributionController,
);
const readApp = buildRouteApp('get', '/quiz/:quizId', authMiddleware, getQuizController);
const liveApp = buildRouteApp('get', '/live/:quizId', GetLivePrizePoolController.process);
const entries = [50, 30, 20].map((percentage, i) => ({ rank: i + 1, percentage }));
const legacy = entries.map((d) => ({
    ...d,
    amount: d.percentage,
    amountBaseUnits: BigInt(d.percentage * 1e6),
}));

beforeEach(() => {
    vi.clearAllMocks();
    db.quiz.findFirst.mockResolvedValue({
        id: 'quiz',
        hostId: TEST_USER.id,
        status: 'CREATED',
        prizePool: 100,
        prizeDistributions: legacy,
    });
    db.quiz.findUnique.mockResolvedValue({
        status: 'LIVE',
        prizePool: 100,
        prizeDistributions: legacy,
    });
    db.prizeDistribution.create.mockImplementation(async ({ data }) => data);
    db.prizeDistribution.deleteMany.mockResolvedValue({ count: 3 });
    db.prizeDistribution.findMany.mockImplementation(async () =>
        db.prizeDistribution.create.mock.calls.map(([arg]) => arg.data),
    );
});

describe('saving prize distributions', () => {
    it('persists and returns post-fee amounts in rank order', async () => {
        const response = await request(saveApp)
            .post('/distribution/quiz')
            .set('Authorization', bearerHeader())
            .send({ distributions: [...entries].reverse() })
            .expect(200);
        expect(db.quiz.findFirst).toHaveBeenCalledWith({
            where: { id: 'quiz', hostId: TEST_USER.id },
        });
        expect(db.$transaction).toHaveBeenCalledOnce();
        expect(
            db.prizeDistribution.create.mock.calls.map(([arg]) => arg.data.amountBaseUnits),
        ).toEqual([BigInt(49_500_000), BigInt(29_700_000), BigInt(19_800_000)]);
        expect(response.body.data.map((d: { amount: number }) => d.amount)).toEqual([
            49.5, 29.7, 19.8,
        ]);
        expect(response.body.data[2].amountBaseUnits).toBe('19800000');
    });

    it.each(
        [
            null,
            [],
            [null],
            [{ rank: 1, percentage: '100' }],
            [
                { rank: 1, percentage: -1 },
                { rank: 2, percentage: 101 },
            ],
            [{ rank: 2, percentage: 100 }],
            [{ rank: 1, percentage: 90 }],
        ].map((value) => [value]),
    )('rejects malformed or unfunded distributions %j', async (distributions) => {
        await request(saveApp)
            .post('/distribution/quiz')
            .set('Authorization', bearerHeader())
            .send({ distributions })
            .expect(400);
        expect(db.$transaction).not.toHaveBeenCalled();
    });

    it('requires authentication and ownership', async () => {
        await request(saveApp)
            .post('/distribution/quiz')
            .send({ distributions: entries })
            .expect(401);
        db.quiz.findFirst.mockResolvedValueOnce(null);
        await request(saveApp)
            .post('/distribution/quiz')
            .set('Authorization', bearerHeader())
            .send({ distributions: entries })
            .expect(404);
        expect(db.$transaction).not.toHaveBeenCalled();
    });

    it('rejects missing pools and reports database failures', async () => {
        db.quiz.findFirst.mockResolvedValueOnce({ prizePool: 0 });
        await request(saveApp)
            .post('/distribution/quiz')
            .set('Authorization', bearerHeader())
            .send({ distributions: entries })
            .expect(400);
        db.quiz.findFirst.mockRejectedValueOnce(new Error('database unavailable'));
        await request(saveApp)
            .post('/distribution/quiz')
            .set('Authorization', bearerHeader())
            .send({ distributions: entries })
            .expect(500);
        expect(db.$transaction).not.toHaveBeenCalled();
    });
});

describe('reading prize distributions', () => {
    it('recalculates legacy gross amounts for the editor', async () => {
        const response = await request(readApp)
            .get('/quiz/quiz')
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(
            response.body.data.quiz.prizeDistributions.map((d: { amount: number }) => d.amount),
        ).toEqual([49.5, 29.7, 19.8]);
        expect(response.body.data.quiz.prizeDistributions[2].amountBaseUnits).toBe('19800000');
    });

    it('recalculates legacy gross amounts for live users', async () => {
        const response = await request(liveApp)
            .get('/live/quiz')
            .set('Cookie', `${NOCTURN_COOKIE_NAME}=valid`)
            .expect(200);
        expect(response.body.data.map((d: { amount: number }) => d.amount)).toEqual([
            49.5, 29.7, 19.8,
        ]);
        expect(response.body.data[2].amountBaseUnits).toBe('19800000');
    });

    it('returns an empty distribution list when none are configured', async () => {
        db.quiz.findUnique.mockResolvedValueOnce({
            status: 'LIVE',
            prizePool: 0,
            prizeDistributions: [],
        });
        const response = await request(liveApp)
            .get('/live/quiz')
            .set('Cookie', `${NOCTURN_COOKIE_NAME}=valid`)
            .expect(200);
        expect(response.body.data).toEqual([]);
    });

    it('preserves live authorization and missing quiz responses', async () => {
        await request(liveApp).get('/live/quiz').expect(401);
        await request(liveApp)
            .get('/live/quiz')
            .set('Cookie', `${NOCTURN_COOKIE_NAME}=invalid`)
            .expect(401);
        db.quiz.findUnique.mockResolvedValueOnce(null);
        await request(liveApp)
            .get('/live/quiz')
            .set('Cookie', `${NOCTURN_COOKIE_NAME}=valid`)
            .expect(404);
    });

    it('reports invalid legacy weights instead of serving unfunded amounts', async () => {
        db.quiz.findUnique.mockResolvedValueOnce({
            status: 'LIVE',
            prizePool: 100,
            prizeDistributions: [{ rank: 1, percentage: 150 }],
        });
        await request(liveApp)
            .get('/live/quiz')
            .set('Cookie', `${NOCTURN_COOKIE_NAME}=valid`)
            .expect(400);
    });
});
