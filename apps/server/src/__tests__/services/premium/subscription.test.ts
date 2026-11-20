import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionEnum } from '@nocturn/types';
import { FEATURE, planManager } from '@nocturn/premium';
import QuizSettings from '../../../class/quizSettings';
import { databaseQueueInstance } from '../../../services/init.services';
import {
    getUserSubscription,
    resolveSubscription,
} from '../../../../../../packages/database/src/subscription';
import Subscription from '../../../middlewares/subscription.middleware';
import DodoWebhookService from '../../../services/premium/DodoWebhookService';

const db = vi.hoisted(() => ({
    userSubscription: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    quiz: { findUnique: vi.fn() },
    payment: { upsert: vi.fn() },
    user: { update: vi.fn() },
    webhookEvent: { findUnique: vi.fn(), update: vi.fn() },
}));
vi.mock('../../../services/init.services', () => ({
    databaseQueueInstance: { update_quiz: vi.fn() },
    quizManagerInstance: { publish_event_to_redis: vi.fn() },
    redisCacheInstance: { redis_cache: { hset: vi.fn().mockResolvedValue(1) } },
}));

vi.mock('../../../../../../packages/database/src/client', () => ({ prisma: db }));
vi.mock('@nocturn/database', async () => ({
    prisma: { ...db, $transaction: async (fn: (tx: typeof db) => Promise<void>) => fn(db) },
    ...(await import('../../../../../../packages/database/src/subscription')),
}));

const now = new Date('2026-11-20T12:00:00Z');
const end = new Date('2026-11-21T12:00:00Z');
const subscription = {
    id: 'sub',
    userId: 'user',
    status: 'ACTIVE' as const,
    currentPeriodEnd: end,
    cancelAt: null,
    trialEnd: null,
    tier: { name: 'PRO' },
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(now);
});

afterEach(() => vi.useRealTimers());

describe('subscription entitlement', () => {
    it.each(['ACTIVE', 'CANCELLED', 'TRIALING'] as const)(
        'keeps %s access through the paid period, then removes it',
        (status) => {
            const record = { ...subscription, status };
            expect(resolveSubscription(record).tier).toBe('PRO');
            vi.setSystemTime(end);
            expect(resolveSubscription(record).tier).toBe('FREE');
        },
    );

    it('does not revoke a paid cancellation immediately', () => {
        expect(
            resolveSubscription({ ...subscription, status: 'CANCELLED', cancelAt: now }).tier,
        ).toBe('PRO');
    });

    it('revokes an expired subscription even if its date is in the future', () => {
        expect(resolveSubscription({ ...subscription, status: 'EXPIRED' }).tier).toBe('FREE');
    });

    it('ends trial access at the trial deadline', () => {
        expect(
            resolveSubscription({ ...subscription, status: 'TRIALING', trialEnd: now }).tier,
        ).toBe('FREE');
    });

    it('gives failed payments three days after the paid period, with an exact deadline', () => {
        const record = { ...subscription, status: 'PAST_DUE' as const };
        const deadline = new Date('2026-11-24T12:00:00Z');
        vi.setSystemTime(new Date(deadline.getTime() - 1));
        expect(resolveSubscription(record)).toMatchObject({
            tier: 'PRO',
            status: 'PAST_DUE',
            accessUntil: deadline,
        });
        vi.setSystemTime(deadline);
        expect(resolveSubscription(record).tier).toBe('FREE');
    });

    it('does not grant Pro for an unknown tier', () => {
        expect(resolveSubscription({ ...subscription, tier: { name: 'OTHER' } }).tier).toBe('FREE');
    });

    it('defaults to Free without a subscription', async () => {
        db.userSubscription.findFirst.mockResolvedValue(null);
        expect(await Subscription.get_user_subscription('user')).toBe(SubscriptionEnum.FREE);
    });

    it('checks the newest record, including its lifecycle fields', async () => {
        db.userSubscription.findFirst.mockResolvedValue({ ...subscription, status: 'EXPIRED' });
        expect((await getUserSubscription('user')).tier).toBe('FREE');
        expect(db.userSubscription.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user' },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                select: expect.objectContaining({ status: true, currentPeriodEnd: true }),
            }),
        );
    });

    it('fails closed if the database is unavailable', async () => {
        db.userSubscription.findFirst.mockRejectedValue(new Error('offline'));
        expect(await Subscription.get_user_subscription('user')).toBeNull();
    });
});

describe('subscription webhooks', () => {
    it('keeps the account tier paid on cancellation until the paid period ends', async () => {
        db.webhookEvent.findUnique.mockResolvedValue({
            payload: {
                type: 'subscription.cancelled',
                data: { subscription_id: 'dodo-sub' },
            },
        });
        db.userSubscription.findUnique.mockResolvedValue(subscription);
        await new DodoWebhookService().processWebhookEvent('event');
        expect(db.userSubscription.update).toHaveBeenCalledWith({
            where: { dodoSubscriptionId: 'dodo-sub' },
            data: { status: 'CANCELLED', cancelAt: end },
        });
        expect(db.user.update).toHaveBeenCalledWith({
            where: { id: 'user' },
            data: { currentTier: 'PRO' },
        });
    });

    it('records past due without extending the paid period', async () => {
        db.webhookEvent.findUnique.mockResolvedValue({
            payload: {
                type: 'subscription.past_due',
                data: { subscription_id: 'dodo-sub' },
            },
        });
        db.userSubscription.findUnique.mockResolvedValue(subscription);
        await new DodoWebhookService().processWebhookEvent('event');
        expect(db.userSubscription.update).toHaveBeenCalledWith({
            where: { dodoSubscriptionId: 'dodo-sub' },
            data: { status: 'PAST_DUE' },
        });
    });
});

describe('feature access after downgrade', () => {
    it.each(['EXPIRED', 'CANCELLED', 'PAST_DUE'] as const)(
        'uses Free limits for %s after the deadline',
        async (status) => {
            db.userSubscription.findFirst.mockResolvedValue({ ...subscription, status });
            vi.setSystemTime(new Date('2026-12-01T00:00:00Z'));
            const tier = await Subscription.get_user_subscription('user');
            expect(tier).toBe(SubscriptionEnum.FREE);
            if (!tier) throw new Error('Expected a resolved tier');
            expect(planManager.isEnabled(tier, FEATURE.CUSTOM_THEME)).toBe(false);
            expect(planManager.isEnabled(tier, FEATURE.LIVE_CHAT)).toBe(false);
            expect(planManager.getNumericLimit(tier, FEATURE.MAX_COLLABORATORS_PER_SESSION)).toBe(
                0,
            );
            expect(planManager.getNumericLimit(tier, FEATURE.MAX_PARTICIPANTS_PER_SESSION)).toBe(
                10,
            );
            expect(planManager.getNumericLimit(tier, FEATURE.MAX_SPECTATORS_PER_SESSION)).toBe(10);
        },
    );

    it('keeps Pro features after a successful renewal', async () => {
        db.userSubscription.findFirst.mockResolvedValue({
            ...subscription,
            currentPeriodEnd: new Date('2026-12-21T12:00:00Z'),
        });
        vi.setSystemTime(new Date('2026-12-01T00:00:00Z'));
        expect(await Subscription.get_user_subscription('user')).toBe(SubscriptionEnum.PRO);
        expect(planManager.isEnabled(SubscriptionEnum.PRO, FEATURE.CUSTOM_THEME)).toBe(true);
    });

    it('checks current entitlement for live chat even with enabled session settings', async () => {
        db.quiz.findUnique.mockResolvedValue({ hostId: 'user' });
        db.userSubscription.findFirst.mockResolvedValue(subscription);
        const settings = new QuizSettings();
        settings.update_memory_settings_state('session', { liveChat: true });
        expect(await settings.is_live_chat_allowed('session', 'quiz')).toBe(true);
        vi.setSystemTime(end);
        expect(await settings.is_live_chat_allowed('session', 'quiz')).toBe(false);
    });

    it('does not enable Pro live settings using an old cached host plan', async () => {
        db.userSubscription.findFirst.mockResolvedValue({ ...subscription, status: 'EXPIRED' });
        const settings = new QuizSettings();
        await settings.update_quiz_settings_on_db_and_cache('session', 'quiz', 'user', {
            liveChat: true,
        });
        expect(databaseQueueInstance.update_quiz).not.toHaveBeenCalled();
    });
});

describe('payment recovery', () => {
    it('marks a failed payment past due so access is bounded by the grace deadline', async () => {
        db.webhookEvent.findUnique.mockResolvedValue({
            payload: {
                type: 'payment.failed',
                data: {
                    payment_id: 'payment',
                    subscription_id: 'dodo-sub',
                    metadata: { user_id: 'user' },
                },
            },
        });
        db.userSubscription.findUnique.mockResolvedValue(subscription);
        await new DodoWebhookService().processWebhookEvent('failed');
        expect(db.userSubscription.update).toHaveBeenCalledWith({
            where: { dodoSubscriptionId: 'dodo-sub' },
            data: { status: 'PAST_DUE' },
        });
    });

    it('restores entitlement on renewal with the new paid period', async () => {
        const renewedEnd = new Date('2026-12-21T12:00:00Z');
        db.webhookEvent.findUnique.mockResolvedValue({
            payload: {
                type: 'subscription.renewed',
                data: {
                    subscription_id: 'dodo-sub',
                    current_period_start: end.getTime() / 1000,
                    current_period_end: renewedEnd.getTime() / 1000,
                },
            },
        });
        db.userSubscription.findUnique.mockResolvedValue({ ...subscription, status: 'PAST_DUE' });
        await new DodoWebhookService().processWebhookEvent('renewed');
        expect(db.userSubscription.update).toHaveBeenCalledWith({
            where: { dodoSubscriptionId: 'dodo-sub' },
            data: { status: 'ACTIVE', currentPeriodStart: end, currentPeriodEnd: renewedEnd },
        });
        expect(
            resolveSubscription(
                { ...subscription, currentPeriodEnd: renewedEnd },
                new Date('2026-12-01T00:00:00Z'),
            ).tier,
        ).toBe('PRO');
    });
});
