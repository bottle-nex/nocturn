import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrizeQueue from '../../queue/prize/prize.queue';
import { createClaimToken, hashClaimToken } from '../../utils/claim-token';

const mocks = vi.hoisted(() => ({
    process: vi.fn(),
    add: vi.fn(),
    finalize: vi.fn(),
    seal: vi.fn(),
    email: vi.fn(),
    updateClaim: vi.fn(),
    updateQuiz: vi.fn(),
}));
vi.mock('bull', () => ({
    default: class {
        process = mocks.process;
        add = mocks.add;
    },
}));
vi.mock('../../configs/env', () => ({
    env: {
        SERVER_PLATFORM_AUTHORITY_KEYPAIR: 'platform-secret',
        SERVER_WEB_URL: 'https://example.com',
        SERVER_REDIS_URL: 'redis://localhost',
    },
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        prizeClaim: { update: mocks.updateClaim },
        quiz: { update: mocks.updateQuiz },
    },
}));
vi.mock('../../services/init.services', () => ({
    solanaServiceInstance: { finalize_quiz_onchain: mocks.finalize, seal_quiz_onchain: mocks.seal },
    email_service_queue_instance: { email_winner_notification: mocks.email },
}));

function jobData() {
    return {
        quizId: 'quiz',
        quizAccountPda: 'quiz-account',
        escrowPda: 'escrow',
        hostWalletPubkey: 'host',
        quizTitle: 'Quiz',
        claims: [
            {
                id: 'claim',
                claimTokenHash: hashClaimToken(createClaimToken('claim', 'platform-secret')),
                emailHash: '00'.repeat(32),
                amountBaseUnits: '1000000',
                rank: 1,
                participantEmail: 'winner@example.com',
                participantName: 'Winner',
                expiresAt: '2099-01-01T00:00:00.000Z',
            },
        ],
    };
}

describe('prize finalization credentials', () => {
    let processor: (job: { data: ReturnType<typeof jobData> }) => Promise<void>;
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.process.mockImplementation((_name: string, callback: typeof processor) => {
            processor = callback;
        });
        new PrizeQueue();
    });

    it('queues and finalizes only a hash, recreating the secret only for the email', async () => {
        const data = jobData();
        await new PrizeQueue().enqueue_finalization(data);
        expect(JSON.stringify(mocks.add.mock.calls)).not.toContain(
            createClaimToken('claim', 'platform-secret'),
        );
        await processor({ data });
        expect(mocks.finalize).toHaveBeenCalledWith(
            'quiz',
            data.claims[0]?.claimTokenHash,
            Array(32).fill(0),
            1000000n,
            1,
            Math.floor(new Date('2099-01-01').getTime() / 1000),
            'host',
        );
        expect(mocks.email).toHaveBeenCalledWith(
            expect.objectContaining({
                claimUrl: `https://example.com/claim?token=${createClaimToken('claim', 'platform-secret')}`,
            }),
        );
    });

    it('fails before finalization when the key cannot recreate the stored credential', async () => {
        const data = jobData();
        data.claims = data.claims.map((claim) => ({ ...claim, claimTokenHash: '11'.repeat(32) }));
        await expect(processor({ data })).rejects.toThrow('requires credential reissuance');
        expect(mocks.finalize).not.toHaveBeenCalled();
        expect(mocks.email).not.toHaveBeenCalled();
        expect(mocks.seal).not.toHaveBeenCalled();
    });
});
