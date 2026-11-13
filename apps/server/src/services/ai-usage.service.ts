import { prisma } from '@nocturn/database';
import { FEATURE, planManager } from '@nocturn/premium';
import { SubscriptionEnum } from '@nocturn/types';

export default class AiUsage {
    static async get_period(userId: string, now = new Date()) {
        const subscription = await prisma.userSubscription.findFirst({
            where: {
                userId,
                status: { in: ['ACTIVE', 'TRIALING'] },
                currentPeriodStart: { lte: now },
                currentPeriodEnd: { gt: now },
            },
            orderBy: { createdAt: 'desc' },
            select: { tier: { select: { name: true } } },
        });
        const tier =
            subscription?.tier.name === 'PRO' ? SubscriptionEnum.PRO : SubscriptionEnum.FREE;
        const limit = planManager.getNumericLimit(tier, FEATURE.AI_GENERATION);
        // Calendar months in UTC keep the same counter across plan changes.
        const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const resetsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        return { userId, feature: FEATURE.AI_GENERATION, periodStart, resetsAt, limit };
    }

    static async get_usage(userId: string) {
        const { resetsAt, limit, ...key } = await AiUsage.get_period(userId);
        const usage = await prisma.usageRecord.findUnique({
            where: { userId_feature_periodStart: key },
        });
        const used = usage?.count ?? 0;
        return {
            used,
            limit,
            remaining: limit === null ? null : Math.max(0, limit - used),
            resetsAt,
        };
    }

    static async reserve(userId: string) {
        const { limit, resetsAt, ...key } = await AiUsage.get_period(userId);
        return prisma.$transaction(async (tx) => {
            // The upsert locks this user's period row. The conditional increment also
            // enforces the limit at the database, including simultaneous requests.
            await tx.usageRecord.upsert({
                where: { userId_feature_periodStart: key },
                create: key,
                update: { count: { increment: 0 } },
            });
            const result = await tx.usageRecord.updateMany({
                where: { ...key, ...(limit === null ? {} : { count: { lt: limit } }) },
                data: { count: { increment: 1 } },
            });
            // Admitted attempts count even if streaming later fails: model work may
            // already have been billed, so refunds could bypass the cost limit.
            return { allowed: result.count === 1, resetsAt };
        });
    }
}
