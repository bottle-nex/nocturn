import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailJob } from '@nocturn/types';
import type Bull from 'bull';
import PrizeQueue from '../../queue/prize/prize.queue';
import EmailServiceQueue from '../../services/email/email.services';

type FinalizationData = Parameters<PrizeQueue['enqueue_finalization']>[0];
type Processor = (job: { data: FinalizationData }) => Promise<void>;

const mocks = vi.hoisted(() => ({
    process: vi.fn<(name: string, processor: Processor) => void>(),
    add: vi.fn(),
    findUnique: vi.fn(),
    updateClaim: vi.fn(),
    updateQuiz: vi.fn(),
    finalize: vi.fn(),
    seal: vi.fn(),
    notify: vi.fn(),
}));

vi.mock('../../configs/env', () => ({
    env: { SERVER_REDIS_URL: 'redis://localhost:6379', SERVER_WEB_URL: 'https://nocturn.app' },
}));

vi.mock('bull', () => ({
    default: class {
        process = mocks.process;
        add = mocks.add;
    },
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        prizeClaim: { findUnique: mocks.findUnique, update: mocks.updateClaim },
        quiz: { update: mocks.updateQuiz },
    },
}));
vi.mock('../../services/init.services', () => ({
    solanaServiceInstance: { finalize_quiz_onchain: mocks.finalize, seal_quiz_onchain: mocks.seal },
    email_service_queue_instance: { email_winner_notification: mocks.notify },
}));

const data: FinalizationData = {
    quizId: 'quiz-1',
    quizAccountPda: 'quiz-account',
    escrowPda: 'escrow',
    hostWalletPubkey: 'host-wallet',
    quizTitle: 'Quiz title',
    claims: [1, 2].map((rank) => ({
        id: `claim-${rank}`,
        claimToken: `token-${rank}`,
        emailHash: 'ab'.repeat(32),
        amountBaseUnits: '2500000',
        rank,
        participantEmail: `winner${rank}@example.com`,
        participantName: `Winner ${rank}`,
        expiresAt: '2026-12-01T00:00:00.000Z',
    })),
};

let processJob: Processor;
let checkpoints: Map<string, Date | null>;
let emailJobs: Map<string, EmailJob>;

function run(jobData = data) {
    return processJob({ data: jobData });
}

describe('PrizeQueue winner notifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        checkpoints = new Map(data.claims.map((claim) => [claim.id, null]));
        emailJobs = new Map();
        mocks.process.mockImplementation((_name, processor) => {
            processJob = processor;
        });
        mocks.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
            checkpoints.has(where.id) ? { emailSentAt: checkpoints.get(where.id) } : null,
        );
        mocks.updateClaim.mockImplementation(
            async ({ where, data }: { where: { id: string }; data: { emailSentAt: Date } }) => {
                checkpoints.set(where.id, data.emailSentAt);
            },
        );
        // Model Bull's atomic duplicate-ID behavior while using the real email producer.
        mocks.add.mockImplementation(async (job: EmailJob, options: Bull.JobOptions) => {
            if (typeof options.jobId !== 'string') throw new Error('Expected a stable job ID');
            if (!emailJobs.has(options.jobId)) emailJobs.set(options.jobId, job);
            return { id: options.jobId };
        });
        const emailQueue = new EmailServiceQueue('email-service-queue');
        mocks.notify.mockImplementation(emailQueue.email_winner_notification.bind(emailQueue));
        mocks.finalize.mockResolvedValue('finalize-tx');
        mocks.seal.mockResolvedValue('seal-tx');
        mocks.updateQuiz.mockResolvedValue({});
        new PrizeQueue();
    });

    it('resumes a partially failed payout without notifying the first winner again', async () => {
        const failure = new Error('Chain unavailable');
        mocks.finalize.mockResolvedValueOnce('tx-1').mockRejectedValueOnce(failure);
        await expect(run()).rejects.toThrow(failure);
        expect(checkpoints.get('claim-1')).toBeInstanceOf(Date);
        expect(checkpoints.get('claim-2')).toBeNull();
        expect(mocks.seal).not.toHaveBeenCalled();

        mocks.finalize.mockRejectedValueOnce(new Error('account already in use'));
        await run();
        expect(mocks.notify.mock.calls.map(([id]) => id)).toEqual(['claim-1', 'claim-2']);
        expect(mocks.finalize).toHaveBeenCalledTimes(4);
        expect(mocks.seal).toHaveBeenCalledWith(data.quizId, data.hostWalletPubkey);
        expect(mocks.updateQuiz).toHaveBeenCalledWith({
            where: { id: data.quizId },
            data: { status: 'COMPLETED' },
        });
    });

    it('preserves existing checkpoints while still finalizing every claim', async () => {
        const checkpoint = new Date('2026-11-01T00:00:00.000Z');
        checkpoints.set('claim-1', checkpoint);
        await run();
        expect(checkpoints.get('claim-1')).toBe(checkpoint);
        expect(mocks.notify).toHaveBeenCalledTimes(1);
        expect(mocks.notify).toHaveBeenCalledWith(
            'claim-2',
            expect.objectContaining({
                email: 'winner2@example.com',
                participantName: 'Winner 2',
                quizTitle: data.quizTitle,
                rank: 2,
                prizeAmount: 2.5,
                claimUrl: expect.stringContaining('/claim?token=token-2'),
                expiresAt: data.claims[1]?.expiresAt,
            }),
        );
        expect(mocks.finalize).toHaveBeenCalledTimes(2);
    });

    it('does not mark a claim with no email as notified', async () => {
        await run({
            ...data,
            claims: data.claims.map((claim) => ({ ...claim, participantEmail: '' })),
        });
        expect(mocks.notify).not.toHaveBeenCalled();
        expect(mocks.updateClaim).not.toHaveBeenCalled();
        expect(mocks.seal).toHaveBeenCalledOnce();
    });

    it('fails explicitly if the persisted claim is missing', async () => {
        checkpoints.delete('claim-1');
        await expect(run()).rejects.toThrow('Prize claim claim-1 not found');
        expect(mocks.notify).not.toHaveBeenCalled();
        expect(mocks.updateQuiz).not.toHaveBeenCalled();
    });

    it('leaves failed email handoffs retryable', async () => {
        mocks.add.mockRejectedValueOnce(new Error('Redis unavailable'));
        await expect(run()).rejects.toThrow('Redis unavailable');
        expect(mocks.updateClaim).not.toHaveBeenCalled();
        expect(checkpoints.get('claim-1')).toBeNull();
        expect(mocks.seal).not.toHaveBeenCalled();
        await run();
        expect(emailJobs.size).toBe(2);
        expect(checkpoints.get('claim-1')).toBeInstanceOf(Date);
    });

    it('reuses the email job when saving its checkpoint fails', async () => {
        mocks.updateClaim.mockRejectedValueOnce(new Error('Database unavailable'));
        await expect(run()).rejects.toThrow('Database unavailable');
        expect(checkpoints.get('claim-1')).toBeNull();
        expect(emailJobs.size).toBe(1);
        await run();
        expect(mocks.notify.mock.calls.map(([id]) => id)).toEqual([
            'claim-1',
            'claim-1',
            'claim-2',
        ]);
        expect(emailJobs.size).toBe(2);
        expect(checkpoints.get('claim-1')).toBeInstanceOf(Date);
    });

    it.each(['seal', 'updateQuiz'] as const)(
        'does not repeat emails after a %s failure',
        async (step) => {
            mocks[step].mockRejectedValueOnce(new Error('Finalization failed'));
            await expect(run()).rejects.toThrow('Finalization failed');
            await run();
            expect(mocks.notify).toHaveBeenCalledTimes(2);
            expect(mocks.updateClaim).toHaveBeenCalledTimes(2);
            expect(mocks.finalize).toHaveBeenCalledTimes(4);
        },
    );
});
