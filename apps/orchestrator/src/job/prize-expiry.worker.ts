import Bull from 'bull';
import { Env } from '../configs/env';
import { prisma } from '@nocturn/database';

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
                repeat: { cron: '*/5 * * * *' }, // recover delivery within the provider idempotency window
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
        const queue = new Bull('prize-finalization', { redis: Env.ORCH_REDIS_URL });
        try {
            await queue.add(
                'RECOVER_WINNER_NOTIFICATIONS',
                {},
                {
                    jobId: 'recover-winner-notifications',
                    attempts: 3,
                    removeOnComplete: true,
                    removeOnFail: true,
                },
            );
            const claims = await prisma.prizeClaim.findMany({
                where: { status: { in: ['PENDING', 'EXPIRED'] } },
                select: { id: true },
            });
            for (const claim of claims)
                await queue.add(
                    'RECONCILE_PRIZE_CLAIM',
                    { claimId: claim.id },
                    { removeOnComplete: true, attempts: 3 },
                );
        } finally {
            await queue.close();
        }
    }
}
