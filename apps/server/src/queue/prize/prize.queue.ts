import Bull from 'bull';
import { env } from '../../configs/env';
import { prisma } from '@nocturn/database';
import { email_service_queue_instance } from '../../services/init.services';

interface ClaimData {
    id: string;
    claimToken: string;
    emailHash: string;
    amountLamports: string;
    rank: number;
    participantEmail: string;
    participantName: string;
    expiresAt: string;
}

interface FinalizationJobData {
    quizId: string;
    quizAccountPda: string;
    escrowPda: string;
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
        return this.queue.add('FINALIZE_PRIZE_ON_CHAIN', data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 20,
            removeOnFail: 10,
        });
    }

    private async process_finalization(data: FinalizationJobData) {
        const { quizId, claims, quizTitle } = data;

        console.log(
            `[PrizeQueue] Starting finalization for quiz ${quizId} with ${claims.length} claims`,
        );

        // For each claim, we would call finalize_quiz on-chain using the platform keypair.
        // The actual on-chain calls will be implemented once the contract is deployed.
        // For now, we mark claims and send notification emails.

        for (const claim of claims) {
            try {
                // TODO: Call finalize_quiz instruction on-chain
                // const tx = await this.call_finalize_quiz_onchain(data, claim);

                console.log(`[PrizeQueue] Finalized claim ${claim.id} for rank ${claim.rank}`);

                // Update claim record with email sent timestamp
                await prisma.prizeClaim.update({
                    where: { id: claim.id },
                    data: { emailSentAt: new Date() },
                });

                // Send winner notification email
                if (claim.participantEmail) {
                    const claimUrl = `${env.SERVER_WEB_URL}/claim?token=${claim.claimToken}`;
                    await email_service_queue_instance.email_winner_notification({
                        email: claim.participantEmail,
                        participantName: claim.participantName,
                        quizTitle: quizTitle,
                        rank: claim.rank,
                        prizeAmount: Number(claim.amountLamports) / 1e9,
                        claimUrl,
                        expiresAt: claim.expiresAt,
                    });
                }
            } catch (error) {
                console.error(`[PrizeQueue] Failed to finalize claim ${claim.id}:`, error);
                throw error; // Let Bull retry
            }
        }

        // TODO: Call seal_quiz instruction on-chain after all claims are finalized
        // await this.call_seal_quiz_onchain(data);

        // Update quiz status to indicate finalization is complete
        await prisma.quiz.update({
            where: { id: quizId },
            data: { status: 'COMPLETED' },
        });

        console.log(`[PrizeQueue] Finalization complete for quiz ${quizId}`);
    }
}
