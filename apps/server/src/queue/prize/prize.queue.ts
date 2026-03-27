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
                // Call finalize_quiz instruction on-chain
                try {
                    const txSig = await solanaServiceInstance.finalize_quiz_onchain(
                        quizId,
                        claim.claimToken,
                        Array.from(Buffer.from(claim.emailHash, 'hex')),
                        BigInt(claim.amountBaseUnits),
                        claim.rank,
                        Math.floor(new Date(claim.expiresAt).getTime() / 1000),
                    );
                    console.log(`[PrizeQueue] Finalized claim ${claim.id} on-chain: ${txSig}`);
                } catch (onChainErr: unknown) {
                    // If PDA already exists (retry scenario), skip
                    const errMsg =
                        onChainErr instanceof Error ? onChainErr.message : String(onChainErr);
                    if (errMsg.includes('already in use')) {
                        console.log(
                            `[PrizeQueue] Claim ${claim.id} already finalized on-chain, skipping`,
                        );
                    } else {
                        throw onChainErr;
                    }
                }

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
                        prizeAmount: Number(claim.amountBaseUnits) / 1e6,
                        claimUrl,
                        expiresAt: claim.expiresAt,
                    });
                }
            } catch (error) {
                console.error(`[PrizeQueue] Failed to finalize claim ${claim.id}:`, error);
                throw error; // Let Bull retry
            }
        }

        // Seal the quiz on-chain after all claims are finalized
        const sealTx = await solanaServiceInstance.seal_quiz_onchain(quizId);
        console.log(`[PrizeQueue] Quiz ${quizId} sealed on-chain: ${sealTx}`);

        // Update quiz status to indicate finalization is complete
        await prisma.quiz.update({
            where: { id: quizId },
            data: { status: 'COMPLETED' },
        });

        console.log(`[PrizeQueue] Finalization complete for quiz ${quizId}`);
    }
}
