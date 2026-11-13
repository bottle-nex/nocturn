import { required } from '../helpers/required';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrizeQueue from '../../queue/prize/prize.queue';

vi.mock('../../configs/env', () => ({
    env: { SERVER_REDIS_URL: 'redis://localhost:6379', SERVER_WEB_URL: 'http://localhost' },
}));
const mocks = vi.hoisted(() => ({
    process: vi.fn<(name: string, processor: (job: { data: unknown }) => Promise<void>) => void>(),
    add: vi.fn(),
    getJob: vi.fn(),
    quiz: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    prizeClaim: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    finalize_quiz_onchain: vi.fn(),
    seal_quiz_onchain: vi.fn(),
    email_winner_notification: vi.fn(),
}));
vi.mock('bull', () => ({
    default: class {
        process = mocks.process;
        add = mocks.add;
        getJob = mocks.getJob;
    },
}));
vi.mock('@nocturn/database', () => ({ prisma: mocks }));
vi.mock('../../services/init.services', () => ({
    solanaServiceInstance: mocks,
    email_service_queue_instance: mocks,
}));
const data = {
    quizId: 'quiz',
    hostWalletPubkey: 'host',
    quizTitle: 'Quiz',
    quizAccountPda: 'quiz-pda',
    escrowPda: 'escrow',
    claims: [1, 2].map((rank) => ({
        id: `claim-${rank}`,
        claimToken: `token-${rank}`,
        emailHash: 'ab',
        amountBaseUnits: '1000000',
        rank,
        participantEmail: `p${rank}@test.com`,
        participantName: `P${rank}`,
        expiresAt: '2026-12-01T00:00:00.000Z',
    })),
};
let queue: PrizeQueue;
let progress: Map<string, { finalizedAt: Date | null; emailSentAt: Date | null }>;
const run = () => required(mocks.process.mock.calls[0])[1]({ data });

beforeEach(() => {
    vi.resetAllMocks();
    progress = new Map(
        data.claims.map((claim) => [claim.id, { finalizedAt: null, emailSentAt: null }]),
    );
    mocks.quiz.findUniqueOrThrow.mockResolvedValue({ prizesFinalizedAt: null });
    mocks.prizeClaim.findUniqueOrThrow.mockImplementation(async ({ where }) => ({
        ...progress.get(where.id),
    }));
    mocks.prizeClaim.update.mockImplementation(async ({ where, data: update }) => {
        Object.assign(required(progress.get(where.id)), update);
    });
    queue = new PrizeQueue();
});

describe('prize finalization retry', () => {
    it('resumes after a later claim fails without finalizing the first again', async () => {
        mocks.finalize_quiz_onchain
            .mockResolvedValueOnce('first')
            .mockRejectedValueOnce(new Error('RPC unavailable'));
        await expect(run()).rejects.toThrow('RPC unavailable');
        expect(mocks.email_winner_notification).not.toHaveBeenCalled();
        expect(mocks.seal_quiz_onchain).not.toHaveBeenCalled();
        await run();
        expect(mocks.finalize_quiz_onchain.mock.calls.map((args) => args[1])).toEqual([
            'token-1',
            'token-2',
            'token-2',
        ]);
        expect(mocks.email_winner_notification).toHaveBeenCalledTimes(2);
        expect(mocks.quiz.update).toHaveBeenCalledWith({
            where: { id: 'quiz' },
            data: { status: 'COMPLETED', prizesFinalizedAt: expect.any(Date) },
        });
    });
    it('does not email previous winners again after a later enqueue fails', async () => {
        mocks.email_winner_notification
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('Redis unavailable'));
        await expect(run()).rejects.toThrow('Redis unavailable');
        expect(required(progress.get('claim-1')).emailSentAt).toBeInstanceOf(Date);
        expect(required(progress.get('claim-2')).emailSentAt).toBeNull();
        await run();
        expect(mocks.email_winner_notification.mock.calls.map((args) => args[1])).toEqual([
            'claim-1',
            'claim-2',
            'claim-2',
        ]);
        expect(mocks.finalize_quiz_onchain).toHaveBeenCalledTimes(2);
    });
    it('reuses the winner job ID if DB recording fails after enqueue', async () => {
        const update = required(mocks.prizeClaim.update.getMockImplementation());
        mocks.prizeClaim.update.mockImplementation(async (args) => {
            if (args.data.emailSentAt) {
                mocks.prizeClaim.update.mockImplementation(update);
                throw new Error('DB unavailable');
            }
            return update(args);
        });
        await expect(run()).rejects.toThrow('DB unavailable');
        await run();
        expect(mocks.email_winner_notification.mock.calls.map((args) => args[1])).toEqual([
            'claim-1',
            'claim-1',
            'claim-2',
        ]);
    });
    it('skips all effects after completion', async () => {
        mocks.quiz.findUniqueOrThrow.mockResolvedValue({ prizesFinalizedAt: new Date() });
        await run();
        expect(mocks.finalize_quiz_onchain).not.toHaveBeenCalled();
        expect(mocks.seal_quiz_onchain).not.toHaveBeenCalled();
        expect(mocks.email_winner_notification).not.toHaveBeenCalled();
    });
    it('keeps one stable finalization job', async () => {
        await queue.enqueue_finalization(data);
        expect(mocks.add).toHaveBeenCalledWith(
            'FINALIZE_PRIZE_ON_CHAIN',
            data,
            expect.objectContaining({
                jobId: 'finalize-quiz',
                removeOnComplete: false,
                removeOnFail: false,
            }),
        );
        const retry = vi.fn();
        const existing = { isFailed: vi.fn().mockResolvedValue(false), retry };
        mocks.getJob.mockResolvedValue(existing);
        await queue.enqueue_finalization(data);
        expect(mocks.add).toHaveBeenCalledOnce();
        expect(retry).not.toHaveBeenCalled();
        existing.isFailed.mockResolvedValue(true);
        await queue.enqueue_finalization(data);
        expect(retry).toHaveBeenCalledOnce();
        expect(mocks.add).toHaveBeenCalledOnce();
    });
});
