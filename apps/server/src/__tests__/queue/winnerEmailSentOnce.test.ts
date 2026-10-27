import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@nocturn/database';
import { email_service_queue_instance } from '../../services/init.services';
import PrizeQueue from '../../queue/prize/prize.queue';

// Bull is only wired up in the constructor; the processor is invoked directly.
vi.mock('bull', () => ({
    default: class FakeBullQueue {
        process() {}
        async add() {
            return {};
        }
        async close() {}
    },
}));

const FINALIZATION_DATA = {
    quizId: 'quiz-1',
    quizAccountPda: 'quiz-pda',
    escrowPda: 'escrow-pda',
    hostWalletPubkey: 'host-wallet',
    quizTitle: 'Test quiz',
    claims: [
        {
            id: 'claim-1',
            claimToken: 'claim-token-1',
            emailHash: 'email-hash-1',
            amountBaseUnits: '50000000',
            rank: 1,
            participantEmail: 'winner@nocturn.dev',
            participantName: 'Winner',
            expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        },
    ],
};

// ---------------------------------------------------------------------------
// The finalization job retries as a whole when a later claim fails on-chain.
// A winner whose email was already recorded must not receive the "you won"
// email a second time.
// ---------------------------------------------------------------------------

describe('winner notification emails', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(email_service_queue_instance.email_winner_notification).mockResolvedValue(
            undefined,
        );
        vi.mocked(prisma.prizeClaim.findUnique).mockResolvedValue({ emailSentAt: null } as never);
        vi.mocked(prisma.prizeClaim.update).mockResolvedValue({} as never);
        vi.mocked(prisma.quiz.update).mockResolvedValue({} as never);
    });

    it('does not email a winner again when the finalization job is retried', async () => {
        const prize_queue = new PrizeQueue();

        // first attempt: the email has never been sent
        await (
            prize_queue as unknown as {
                process_finalization: (data: unknown) => Promise<void>;
            }
        ).process_finalization(FINALIZATION_DATA);
        expect(email_service_queue_instance.email_winner_notification).toHaveBeenCalledTimes(1);

        // Bull retries the whole job after a later failure on-chain; the
        // claim already recorded emailSentAt, so it must not email again
        vi.mocked(prisma.prizeClaim.findUnique).mockResolvedValue({
            emailSentAt: new Date('2026-01-01T00:00:00.000Z'),
        } as never);
        await (
            prize_queue as unknown as {
                process_finalization: (data: unknown) => Promise<void>;
            }
        ).process_finalization(FINALIZATION_DATA);

        expect(email_service_queue_instance.email_winner_notification).toHaveBeenCalledTimes(1);
    });
});
