import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrizeQueue from '../../../queue/prize/prize.queue';

const mocks = vi.hoisted(() => ({
    queue: {
        process:
            vi.fn<
                (
                    name: string,
                    callback: (job: { data: { quizId: string } }) => Promise<void>,
                ) => void
            >(),
        getJob: vi.fn(),
        add: vi.fn(),
    },
    prisma: {
        quiz: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
        prizeClaim: { update: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() },
        $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
    },
    solana: {
        fetch_quiz: vi.fn(),
        fetch_claim: vi.fn(),
        finalize_quiz_onchain: vi.fn(),
        seal_quiz_onchain: vi.fn(),
        platformPublicKey: 'platform',
    },
    email: { email_winner_notification: vi.fn() },
}));
vi.mock('../../../configs/env', () => ({
    env: { SERVER_REDIS_URL: 'redis://localhost:6379', SERVER_WEB_URL: 'https://example.com' },
}));
vi.mock('bull', () => ({
    default: class {
        constructor() {
            return mocks.queue;
        }
    },
}));
vi.mock('@nocturn/database', () => ({ prisma: mocks.prisma }));
vi.mock('../../../services/init.services', () => ({
    solanaServiceInstance: mocks.solana,
    email_service_queue_instance: mocks.email,
}));

const deadline = 2000000000;
const chainQuiz = {
    isCancelled: false,
    platformAuthority: { equals: () => true },
    totalWinners: 1,
    isFinalized: true,
    claimExpiry: { toNumber: () => deadline },
};
const account = {
    quizId: 'quiz',
    claimToken: 'secret',
    amount: { toString: () => '99000000' },
    rank: 1,
    winnerEmailHash: Array(32).fill(171),
};
const quiz = {
    id: 'quiz',
    payoutPreparedAt: new Date(),
    hostWalletPubkey: 'host',
    title: 'Quiz',
    prizeClaims: [
        {
            id: 'claim',
            claimToken: 'secret',
            amountBaseUnits: BigInt(99000000),
            rank: 1,
            emailHash: 'ab'.repeat(32),
            emailQueuedAt: null,
            emailSentAt: null,
            participant: { email: 'winner@example.com', nickname: 'Winner' },
        },
    ],
};

async function processJob() {
    const processor = mocks.queue.process.mock.calls.find(
        ([name]) => name === 'FINALIZE_PRIZE_ON_CHAIN',
    )?.[1];
    if (!processor) throw new Error('Finalization processor is missing');
    await processor({ data: { quizId: 'quiz' } });
}

describe('prize finalization recovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.queue.getJob.mockResolvedValue(null);
        mocks.prisma.quiz.findUniqueOrThrow.mockResolvedValue(quiz);
        mocks.prisma.quiz.update.mockResolvedValue({});
        mocks.prisma.prizeClaim.update.mockResolvedValue({});
        mocks.prisma.prizeClaim.updateMany.mockResolvedValue({ count: 1 });
        mocks.solana.fetch_quiz.mockResolvedValue(chainQuiz);
        mocks.solana.fetch_claim.mockResolvedValue(account);
        mocks.email.email_winner_notification.mockResolvedValue({ id: 'email' });
        new PrizeQueue();
    });

    it('resumes an already sealed quiz and queues notifications after persisting activation', async () => {
        await processJob();
        expect(mocks.solana.finalize_quiz_onchain).not.toHaveBeenCalled();
        expect(mocks.solana.seal_quiz_onchain).not.toHaveBeenCalled();
        expect(mocks.prisma.prizeClaim.updateMany).toHaveBeenCalledWith({
            where: { quizId: 'quiz' },
            data: { expiresAt: new Date(deadline * 1000) },
        });
        expect(mocks.email.email_winner_notification).toHaveBeenCalledWith(
            expect.objectContaining({
                claimId: 'claim',
                expiresAt: new Date(deadline * 1000).toISOString(),
            }),
        );
        expect(mocks.prisma.prizeClaim.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
            mocks.email.email_winner_notification.mock.invocationCallOrder[0]!,
        );
    });

    it('refuses mismatched existing accounts instead of swallowing an already-in-use error', async () => {
        mocks.solana.fetch_claim.mockResolvedValueOnce({
            ...account,
            amount: { toString: () => '1' },
        });
        await expect(processJob()).rejects.toThrow('does not match');
        expect(mocks.email.email_winner_notification).not.toHaveBeenCalled();
        expect(mocks.prisma.quiz.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { payoutError: expect.stringContaining('does not match') },
            }),
        );
    });

    it('does not send emails when sealing fails after partial finalization', async () => {
        mocks.solana.fetch_quiz.mockResolvedValue({ ...chainQuiz, isFinalized: false });
        mocks.solana.seal_quiz_onchain.mockRejectedValueOnce(new Error('seal unavailable'));
        await expect(processJob()).rejects.toThrow('seal unavailable');
        expect(mocks.email.email_winner_notification).not.toHaveBeenCalled();
        expect(mocks.prisma.prizeClaim.update).not.toHaveBeenCalled();
    });

    it('does not mark email work queued when enqueue fails', async () => {
        mocks.email.email_winner_notification.mockRejectedValueOnce(new Error('redis unavailable'));
        await expect(processJob()).rejects.toThrow('redis unavailable');
        expect(mocks.prisma.prizeClaim.update).not.toHaveBeenCalled();
    });

    it('does not enqueue notifications already delivered', async () => {
        mocks.prisma.quiz.findUniqueOrThrow.mockResolvedValueOnce({
            ...quiz,
            prizeClaims: [
                { ...quiz.prizeClaims[0], emailQueuedAt: new Date(), emailSentAt: new Date() },
            ],
        });
        await processJob();
        expect(mocks.email.email_winner_notification).not.toHaveBeenCalled();
    });

    it('revisits queued but undelivered notifications on a payout retry', async () => {
        mocks.prisma.quiz.findUniqueOrThrow.mockResolvedValueOnce({
            ...quiz,
            prizeClaims: [{ ...quiz.prizeClaims[0], emailQueuedAt: new Date() }],
        });
        await processJob();
        expect(mocks.email.email_winner_notification).toHaveBeenCalledOnce();
    });

    it('recovers unsent notifications independently of a completed finalization job', async () => {
        mocks.prisma.prizeClaim.findMany.mockResolvedValueOnce([
            {
                ...quiz.prizeClaims[0],
                emailQueuedAt: new Date(),
                expiresAt: new Date(deadline * 1000),
                quiz,
            },
        ]);
        const recover = mocks.queue.process.mock.calls.find(
            ([name]) => name === 'RECOVER_WINNER_NOTIFICATIONS',
        )?.[1];
        if (!recover) throw new Error('Notification recovery processor is missing');
        await recover({ data: { quizId: 'quiz' } });
        expect(mocks.prisma.prizeClaim.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    emailSentAt: null,
                    expiresAt: { gt: expect.any(Date) },
                    quiz: { payoutSealedAt: { not: null } },
                },
            }),
        );
        expect(mocks.email.email_winner_notification).toHaveBeenCalledOnce();
        expect(mocks.solana.fetch_quiz).not.toHaveBeenCalled();
        expect(mocks.solana.seal_quiz_onchain).not.toHaveBeenCalled();
    });

    it('can finish an empty frozen batch', async () => {
        mocks.prisma.quiz.findUniqueOrThrow.mockResolvedValueOnce({ ...quiz, prizeClaims: [] });
        mocks.solana.fetch_quiz.mockResolvedValue({ ...chainQuiz, totalWinners: 0 });
        await processJob();
        expect(mocks.solana.fetch_claim).not.toHaveBeenCalled();
        expect(mocks.email.email_winner_notification).not.toHaveBeenCalled();
    });

    it('retries the retained failed job instead of creating another batch', async () => {
        const existing = { isFailed: vi.fn().mockResolvedValue(true), retry: vi.fn() };
        mocks.queue.getJob.mockResolvedValueOnce(existing);
        const worker = new PrizeQueue();
        await worker.enqueue_finalization({ quizId: 'quiz' });
        expect(existing.retry).toHaveBeenCalledOnce();
        expect(mocks.queue.add).not.toHaveBeenCalled();
    });
});
