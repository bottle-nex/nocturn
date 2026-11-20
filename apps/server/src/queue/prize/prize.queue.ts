import Bull from 'bull';
import { env } from '../../configs/env';
import { prisma } from '@nocturn/database';
import { email_service_queue_instance, solanaServiceInstance } from '../../services/init.services';

interface FinalizationJobData {
    quizId: string;
}

interface WinnerNotificationClaim {
    id: string;
    claimToken: string;
    rank: number;
    amountBaseUnits: bigint;
    expiresAt: Date | null;
    emailSentAt: Date | null;
    participant: { email: string; nickname: string };
}

export default class PrizeQueue {
    private queue: Bull.Queue;

    constructor() {
        this.queue = new Bull('prize-finalization', { redis: env.SERVER_REDIS_URL });
        this.setup_processor();
    }

    private setup_processor() {
        this.queue.process('RECOVER_WINNER_NOTIFICATIONS', async () => {
            const claims = await prisma.prizeClaim.findMany({
                where: {
                    emailSentAt: null,
                    expiresAt: { gt: new Date() },
                    quiz: { payoutSealedAt: { not: null } },
                },
                include: { participant: true, quiz: true },
            });
            for (const claim of claims) await this.enqueue_notification(claim, claim.quiz.title);
        });
        this.queue.process('RECONCILE_PRIZE_CLAIM', async (job) => {
            const claim = await prisma.prizeClaim.findUniqueOrThrow({
                where: { id: job.data.claimId },
                include: { quiz: true },
            });
            const settlement = await solanaServiceInstance.reconcile_claim(
                claim.quizId,
                claim.claimToken,
                claim.quiz.hostWalletPubkey || '',
                claim.amountBaseUnits,
            );
            await prisma.prizeClaim.updateMany({
                where: { id: claim.id, updatedAt: claim.updatedAt },
                data: settlement,
            });
        });
        this.queue.process('FINALIZE_PRIZE_ON_CHAIN', async (job) => {
            const { quizId }: FinalizationJobData = job.data;
            try {
                await this.process_finalization(quizId);
                await prisma.quiz.update({ where: { id: quizId }, data: { payoutError: null } });
            } catch (error) {
                await prisma.quiz.update({
                    where: { id: quizId },
                    data: {
                        payoutError:
                            error instanceof Error ? error.message : 'Prize finalization failed',
                    },
                });
                throw error;
            }
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

    private async process_finalization(quizId: string) {
        const quiz = await prisma.quiz.findUniqueOrThrow({
            where: { id: quizId },
            include: {
                prizeClaims: { include: { participant: true }, orderBy: { rank: 'asc' } },
            },
        });
        if (!quiz.payoutPreparedAt || !quiz.hostWalletPubkey)
            throw new Error('Prize batch is not prepared');
        const hostWallet = quiz.hostWalletPubkey;
        let chainQuiz = await solanaServiceInstance.fetch_quiz(quizId, hostWallet);
        if (
            chainQuiz.isCancelled ||
            !chainQuiz.platformAuthority.equals(solanaServiceInstance.platformPublicKey)
        ) {
            throw new Error('Quiz is cancelled or platform approval is missing');
        }
        for (const claim of quiz.prizeClaims) {
            let account = await solanaServiceInstance.fetch_claim(quizId, claim.claimToken);
            if (!account) {
                if (chainQuiz.isFinalized)
                    throw new Error('Sealed quiz is missing a winner account');
                await solanaServiceInstance.finalize_quiz_onchain(
                    quizId,
                    claim.claimToken,
                    Array.from(Buffer.from(claim.emailHash, 'hex')),
                    claim.amountBaseUnits,
                    claim.rank,
                    0,
                    hostWallet,
                );
                account = await solanaServiceInstance.fetch_claim(quizId, claim.claimToken);
            }
            if (
                !account ||
                account.quizId !== quizId ||
                account.claimToken !== claim.claimToken ||
                account.amount.toString() !== claim.amountBaseUnits.toString() ||
                account.rank !== claim.rank ||
                Buffer.from(account.winnerEmailHash).toString('hex') !== claim.emailHash
            ) {
                throw new Error(`On-chain prize does not match frozen claim ${claim.id}`);
            }
        }
        chainQuiz = await solanaServiceInstance.fetch_quiz(quizId, hostWallet);
        if (chainQuiz.totalWinners !== quiz.prizeClaims.length)
            throw new Error('On-chain winner count does not match frozen batch');
        if (!chainQuiz.isFinalized) {
            await solanaServiceInstance.seal_quiz_onchain(quizId, hostWallet);
            chainQuiz = await solanaServiceInstance.fetch_quiz(quizId, hostWallet);
        }
        if (!chainQuiz.isFinalized || chainQuiz.claimExpiry.toNumber() <= 0)
            throw new Error('Quiz seal is not confirmed');
        const expiresAt = new Date(chainQuiz.claimExpiry.toNumber() * 1000);
        await prisma.$transaction([
            prisma.prizeClaim.updateMany({ where: { quizId }, data: { expiresAt } }),
            prisma.quiz.update({
                where: { id: quizId },
                data: {
                    status: 'COMPLETED',
                    payoutSealedAt: new Date(expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000),
                },
            }),
        ]);
        for (const claim of quiz.prizeClaims) {
            await this.enqueue_notification({ ...claim, expiresAt }, quiz.title);
        }
    }

    private async enqueue_notification(claim: WinnerNotificationClaim, quizTitle: string) {
        if (claim.emailSentAt || !claim.expiresAt || claim.expiresAt.getTime() <= Date.now())
            return;
        // Enqueue is not delivery: inspect/retry the retained winner job until
        // provider acceptance is recorded, even when emailQueuedAt was persisted.
        await email_service_queue_instance.email_winner_notification({
            claimId: claim.id,
            email: claim.participant.email,
            participantName: claim.participant.nickname,
            quizTitle,
            rank: claim.rank,
            prizeAmount: Number(claim.amountBaseUnits) / 1e6,
            claimUrl: `${env.SERVER_WEB_URL}/claim?token=${claim.claimToken}`,
            expiresAt: claim.expiresAt.toISOString(),
        });
        await prisma.prizeClaim.update({
            where: { id: claim.id },
            data: { emailQueuedAt: new Date() },
        });
    }
}
