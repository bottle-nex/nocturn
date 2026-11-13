import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { prisma } from '@nocturn/database';
import AiUsage from '../../services/ai-usage.service';
import Subscription from '../../middlewares/subscription.middleware';
import { FEATURE } from '@nocturn/premium';
import authMiddleware from '../../middlewares/auth.middleware';
import { buildRouteApp } from '../helpers/app.helper';
import { generateAccessToken } from '../helpers/auth.helper';

const mocks = vi.hoisted(() => ({
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        userSubscription: { findFirst: mocks.findFirst },
        usageRecord: { findUnique: mocks.findUnique },
        $transaction: vi.fn(async (fn) => fn({ usageRecord: mocks })),
    },
}));

const app = buildRouteApp(
    'post',
    '/generate',
    authMiddleware,
    Subscription.checkUsageLimit(FEATURE.AI_GENERATION),
    (_req, res) => {
        res.sendStatus(200);
    },
);
const usageApp = buildRouteApp('get', '/usage', authMiddleware, Subscription.ai_usage);

describe('AI usage limits', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.findFirst.mockResolvedValue(null);
        mocks.findUnique.mockResolvedValue(null);
        mocks.upsert.mockResolvedValue({ count: 0 });
        mocks.updateMany.mockResolvedValue({ count: 1 });
    });

    it('uses three generations per UTC calendar month for FREE', async () => {
        const period = await AiUsage.get_period('user', new Date('2026-12-31T23:59:59Z'));
        expect(period.limit).toBe(3);
        expect(period.periodStart.toISOString()).toBe('2026-12-01T00:00:00.000Z');
        expect(period.resetsAt.toISOString()).toBe('2027-01-01T00:00:00.000Z');
        const next = await AiUsage.get_period('user', new Date('2027-01-01T00:00:00Z'));
        expect(next.periodStart).toEqual(period.resetsAt);
        expect(mocks.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    status: { in: ['ACTIVE', 'TRIALING'] },
                    currentPeriodEnd: { gt: new Date('2027-01-01T00:00:00Z') },
                }),
            }),
        );
    });

    it('reports an empty period and clamps exhausted remaining usage to zero', async () => {
        expect(await AiUsage.get_usage('user')).toMatchObject({ used: 0, remaining: 3, limit: 3 });
        mocks.findUnique.mockResolvedValue({ count: 4 });
        expect(await AiUsage.get_usage('user')).toMatchObject({ used: 4, remaining: 0 });
    });

    it('counts PRO attempts while allowing unlimited generations', async () => {
        mocks.findFirst.mockResolvedValue({ tier: { name: 'PRO' } });
        expect(await AiUsage.get_usage('user')).toMatchObject({ limit: null, remaining: null });
        expect((await AiUsage.reserve('user')).allowed).toBe(true);
        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: expect.not.objectContaining({ count: expect.anything() }),
            data: { count: { increment: 1 } },
        });
    });

    it('atomically increments only when below the FREE limit', async () => {
        expect((await AiUsage.reserve('user')).allowed).toBe(true);
        expect(prisma.$transaction).toHaveBeenCalledOnce();
        expect(mocks.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: { count: { increment: 0 } },
            }),
        );
        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: expect.objectContaining({
                userId: 'user',
                feature: 'AI_GENERATION',
                count: { lt: 3 },
            }),
            data: { count: { increment: 1 } },
        });
        mocks.updateMany.mockResolvedValue({ count: 0 });
        expect((await AiUsage.reserve('user')).allowed).toBe(false);
    });

    it('rejects unauthenticated requests before counting usage', async () => {
        await request(app).post('/generate').send({ instruction: 'Quiz' }).expect(401);
        expect(mocks.upsert).not.toHaveBeenCalled();
        await request(usageApp).get('/usage').expect(401);
    });

    it.each(['', '   ', 'x'.repeat(4001), null])(
        'rejects invalid input without consuming quota',
        async (instruction) => {
            await request(app)
                .post('/generate')
                .set('Authorization', `Bearer ${generateAccessToken()}`)
                .send({ instruction })
                .expect(400);
            expect(mocks.upsert).not.toHaveBeenCalled();
        },
    );

    it('allows valid input and returns a clear 429 when the atomic reservation fails', async () => {
        await request(app)
            .post('/generate')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ instruction: 'x'.repeat(4000) })
            .expect(200);
        mocks.updateMany.mockResolvedValue({ count: 0 });
        const response = await request(app)
            .post('/generate')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ instruction: 'Quiz' })
            .expect(429);
        expect(response.body.error.code).toBe('USAGE_LIMIT_REACHED');
        expect(response.body.message).toContain('Upgrade');
    });

    it('fails closed on a database error and reports usage via the authenticated endpoint', async () => {
        mocks.findFirst.mockRejectedValueOnce(new Error('database unavailable'));
        await request(app)
            .post('/generate')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ instruction: 'Quiz' })
            .expect(500);
        const response = await request(usageApp)
            .get('/usage')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .expect(200);
        expect(response.body.data).toMatchObject({ used: 0, remaining: 3 });
    });
});
