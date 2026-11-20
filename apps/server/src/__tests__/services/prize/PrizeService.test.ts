import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrizeService from '../../../services/prize/PrizeService';

const transaction = vi.hoisted(() => ({
    $queryRaw: vi.fn(),
    quiz: { findUnique: vi.fn(), update: vi.fn() },
    participant: { findFirst: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
    prizeClaim: { create: vi.fn(), findMany: vi.fn() },
    gameSession: { update: vi.fn() },
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
            callback(transaction),
        ),
    },
}));

const quiz = {
    id: 'quiz',
    status: 'LIVE',
    fundedBaseUnits: '99000000',
    payoutPreparedAt: null,
    prizeDistributions: [{ rank: 1, percentage: 100 }],
    prizeClaims: [],
};
const participants = [{ id: 'winner', totalScore: 100 }];

describe('PrizeService.prepare_claims', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        transaction.quiz.findUnique.mockResolvedValue(quiz);
        transaction.participant.findFirst.mockResolvedValue({ id: 'winner' });
        transaction.participant.findUniqueOrThrow.mockResolvedValue({
            email: 'winner@example.com',
        });
        transaction.prizeClaim.findMany.mockResolvedValue([{ id: 'claim' }]);
    });

    it('locks the quiz and creates claims, ranks and completed results in one transaction', async () => {
        await expect(PrizeService.prepare_claims('quiz', 'session', participants)).resolves.toEqual(
            [{ id: 'claim' }],
        );
        expect(transaction.$queryRaw).toHaveBeenCalledWith(expect.any(Array), 'quiz');
        expect(transaction.prizeClaim.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                quizId: 'quiz',
                participantId: 'winner',
                amountBaseUnits: BigInt(99000000),
            }),
        });
        expect(transaction.gameSession.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'session', quizId: 'quiz' },
                data: expect.objectContaining({ status: 'COMPLETED' }),
            }),
        );
        expect(transaction.quiz.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: 'PAYOUT_PENDING',
                    payoutPreparedAt: expect.any(Date),
                }),
            }),
        );
    });

    it('returns the frozen claims without minting new tokens on repeated results', async () => {
        transaction.quiz.findUnique.mockResolvedValue({
            ...quiz,
            payoutPreparedAt: new Date(),
            prizeClaims: [{ id: 'existing' }],
        });
        expect(await PrizeService.prepare_claims('quiz', 'session', participants)).toEqual([
            { id: 'existing' },
        ]);
        expect(transaction.prizeClaim.create).not.toHaveBeenCalled();
        expect(transaction.quiz.update).not.toHaveBeenCalled();
    });

    it('refuses to silently replace historical claims that need reconciliation', async () => {
        transaction.quiz.findUnique.mockResolvedValue({ ...quiz, prizeClaims: [{ id: 'legacy' }] });
        await expect(PrizeService.prepare_claims('quiz', 'session', participants)).rejects.toThrow(
            'reconciliation',
        );
        expect(transaction.prizeClaim.create).not.toHaveBeenCalled();
    });

    it('requires verified funding and refuses a foreign participant', async () => {
        transaction.quiz.findUnique.mockResolvedValueOnce({ ...quiz, fundedBaseUnits: null });
        await expect(PrizeService.prepare_claims('quiz', 'session', participants)).rejects.toThrow(
            'funding',
        );
        transaction.participant.findFirst.mockResolvedValue(null);
        await expect(PrizeService.prepare_claims('quiz', 'session', participants)).rejects.toThrow(
            'does not belong',
        );
        expect(transaction.prizeClaim.create).not.toHaveBeenCalled();
    });

    it('propagates a failed claim write without announcing prepared results', async () => {
        transaction.prizeClaim.create.mockRejectedValue(new Error('database unavailable'));
        await expect(PrizeService.prepare_claims('quiz', 'session', participants)).rejects.toThrow(
            'database unavailable',
        );
        expect(transaction.quiz.update).not.toHaveBeenCalled();
        expect(transaction.gameSession.update).not.toHaveBeenCalled();
    });

    it('freezes an empty batch so later results cannot add new winners', async () => {
        await PrizeService.prepare_claims('quiz', 'session', []);
        expect(transaction.prizeClaim.create).not.toHaveBeenCalled();
        expect(transaction.quiz.update).toHaveBeenCalled();
    });
});
