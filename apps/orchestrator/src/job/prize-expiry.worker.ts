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

        if (result.count > 0) {
            console.log(`[PrizeExpiryWorker] Marked ${result.count} claims as EXPIRED`);
        }
    }
}
