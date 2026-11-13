import Bull from 'bull';
import { Env } from '../configs/env';
import { prisma } from '@nocturn/database';
import ResendService from '../services/email/resend.services';

export default class PrizeExpiryWorker {
    private queue: Bull.Queue;

    constructor() {
        this.queue = new Bull('prize-expiry', {
            redis: Env.ORCH_REDIS_URL,
        });

        this.setup_recurring_job();
        this.setup_processor();
    }

    private setup_recurring_job() {
        this.queue.add(
            'check-expired-claims',
            {},
            {
                repeat: { cron: '0 0 * * *' }, // daily at midnight
                removeOnComplete: 5,
                removeOnFail: 5,
            },
        );
    }

    private setup_processor() {
        this.queue.process('check-expired-claims', async () => {
            await this.expire_pending_claims();
        });
    }

    private async expire_pending_claims() {
        const now = new Date();

        const result = await prisma.prizeClaim.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: { lt: now },
            },
            data: {
                status: 'EXPIRED',
            },
        });

        const expired = await prisma.prizeClaim.findMany({
            where: {
                status: 'EXPIRED',
                expiryNotifiedAt: null,
                quiz: {
                    escrowPda: { not: null },
                    status: { in: ['COMPLETED', 'PAYOUT_COMPLETED'] },
                },
            },
            include: { quiz: { include: { host: { select: { email: true } } } } },
        });
        const notifications = await Promise.allSettled(
            expired.map(async (claim) => {
                await ResendService.send_prize_expired_email({
                    claimId: claim.id,
                    email: claim.quiz.host.email,
                    quizTitle: claim.quiz.title,
                    rank: claim.rank,
                    amountBaseUnits: claim.amountBaseUnits,
                });
                await prisma.prizeClaim.update({
                    where: { id: claim.id },
                    data: { expiryNotifiedAt: new Date() },
                });
            }),
        );
        const failures = notifications.filter((notification) => notification.status === 'rejected');
        if (failures.length > 0) {
            const messages = failures.map((failure) =>
                failure.reason instanceof Error ? failure.reason.message : String(failure.reason),
            );
            throw new Error(`Failed to notify hosts about expired prizes: ${messages.join('; ')}`);
        }

        if (result.count > 0) {
            console.log(`[PrizeExpiryWorker] Marked ${result.count} claims as EXPIRED`);
        }
    }
}
