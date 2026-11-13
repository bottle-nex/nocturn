import Bull from 'bull';
import { env } from '../../configs/env';
import { prisma } from '@nocturn/database';
import { email_service_queue_instance, solanaServiceInstance } from '../../services/init.services';

interface ClaimData {
    id: string;
    claimToken: string;
    emailHash: string;
    amountBaseUnits: string;
    rank: number;
    participantEmail: string;
    participantName: string;
    expiresAt: string;
}

interface FinalizationJobData {
    quizId: string;
    quizAccountPda: string;
    escrowPda: string;
    hostWalletPubkey: string;
    claims: ClaimData[];
    quizTitle: string;
}

export default class PrizeQueue {
    private queue: Bull.Queue;

    constructor() {
        this.queue = new Bull('prize-finalization', {
            redis: env.SERVER_REDIS_URL,
        });
        this.setup_processor();
    }

    private setup_processor() {
        this.queue.process('FINALIZE_PRIZE_ON_CHAIN', async (job) => {
            await this.process_finalization(job.data as FinalizationJobData);
        });
    }

    public async enqueue_finalization(data: FinalizationJobData) {
        const jobId = `finalize-${data.quizId}`;
        const existing = await this.queue.getJob(jobId);
        if (existing) {
            if (await existing.isFailed()) await existing.retry();
            return existing;
        }
        return this.queue.add('FINALIZE_PRIZE_ON_CHAIN', data, {
            jobId,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: false,
            removeOnFail: false,
        });
    }

    private async process_finalization(data: FinalizationJobData) {
        const { quizId, hostWalletPubkey, claims, quizTitle } = data;
        const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
        if (quiz.prizesFinalizedAt) return;

        for (const claim of claims) {
            const progress = await prisma.prizeClaim.findUniqueOrThrow({ where: { id: claim.id } });
            if (progress.finalizedAt) continue;
            await solanaServiceInstance.finalize_quiz_onchain(
                quizId,
                claim.claimToken,
                Array.from(Buffer.from(claim.emailHash, 'hex')),
                BigInt(claim.amountBaseUnits),
                claim.rank,
                Math.floor(new Date(claim.expiresAt).getTime() / 1000),
                hostWalletPubkey,
            );
            await prisma.prizeClaim.update({
                where: { id: claim.id },
                data: { finalizedAt: new Date() },
            });
        }

        // The service reads chain state before sealing, covering a crash after RPC success.
        await solanaServiceInstance.seal_quiz_onchain(quizId, hostWalletPubkey);

        for (const claim of claims) {
            const progress = await prisma.prizeClaim.findUniqueOrThrow({ where: { id: claim.id } });
            if (progress.emailSentAt || !claim.participantEmail) continue;
            await email_service_queue_instance.email_winner_notification(
                {
                    email: claim.participantEmail,
                    participantName: claim.participantName,
                    quizTitle,
                    rank: claim.rank,
                    prizeAmount: Number(claim.amountBaseUnits) / 1e6,
                    claimUrl: `${env.SERVER_WEB_URL}/claim?token=${claim.claimToken}`,
                    expiresAt: claim.expiresAt,
                },
                claim.id,
            );
            await prisma.prizeClaim.update({
                where: { id: claim.id },
                data: { emailSentAt: new Date() },
            });
        }

        await prisma.quiz.update({
            where: { id: quizId },
            data: { status: 'COMPLETED', prizesFinalizedAt: new Date() },
        });
    }
}
