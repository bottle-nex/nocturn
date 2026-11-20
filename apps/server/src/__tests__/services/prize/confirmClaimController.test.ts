import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Router } from 'express';
import { buildTestApp } from '../../helpers/app.helper';
import confirmClaimController from '../../../controllers/prize-controller/confirmClaimController';

const mocks = vi.hoisted(() => ({
    claim: { findUnique: vi.fn(), update: vi.fn() },
    solana: { verify_claim_tx: vi.fn() },
}));
vi.mock('@nocturn/database', () => ({ prisma: { prizeClaim: mocks.claim } }));
vi.mock('../../../services/init.services', () => ({ solanaServiceInstance: mocks.solana }));
const router = Router();
router.post('/prize/claim/:token/confirm', confirmClaimController);
const app = buildTestApp(router);
const claim = {
    id: 'claim',
    quizId: 'quiz',
    claimToken: 'secret',
    amountBaseUnits: BigInt(99),
    status: 'PENDING',
    expiresAt: new Date(0),
    quiz: { hostWalletPubkey: 'host' },
};
const paidAt = new Date('2026-01-01T00:00:00Z');

function confirm() {
    return request(app)
        .post('/api/v1/prize/claim/secret/confirm')
        .send({ txSignature: 'real-payment', claimerWallet: 'winner' });
}

describe('confirmClaimController payment evidence', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.claim.findUnique.mockResolvedValue(claim);
        mocks.solana.verify_claim_tx.mockResolvedValue({ claimedAt: paidAt });
        mocks.claim.update.mockResolvedValue({
            id: 'claim',
            status: 'CLAIMED',
            claimedAt: paidAt,
            txSignature: 'real-payment',
        });
    });

    it('records a verified payment even when confirmation arrives after expiry', async () => {
        await confirm().expect(200);
        expect(mocks.solana.verify_claim_tx).toHaveBeenCalledWith(
            'real-payment',
            'quiz',
            'secret',
            'host',
            'winner',
            BigInt(99),
        );
        expect(mocks.claim.update).toHaveBeenCalledWith({
            where: { id: 'claim' },
            data: {
                status: 'CLAIMED',
                claimedAt: paidAt,
                claimerWallet: 'winner',
                txSignature: 'real-payment',
            },
        });
    });

    it('reconciles an incorrectly expired record from verified on-chain payment', async () => {
        mocks.claim.findUnique.mockResolvedValueOnce({ ...claim, status: 'EXPIRED' });
        await confirm().expect(200);
        expect(mocks.claim.update).toHaveBeenCalledOnce();
    });

    it('rejects an unrelated successful transaction without changing claim status', async () => {
        mocks.solana.verify_claim_tx.mockResolvedValueOnce(null);
        await confirm().expect(400);
        expect(mocks.claim.update).not.toHaveBeenCalled();
    });

    it('returns the same verified result for repeated confirmation', async () => {
        mocks.claim.findUnique.mockResolvedValueOnce({ ...claim, status: 'CLAIMED' });
        await confirm().expect(200);
        expect(mocks.solana.verify_claim_tx).toHaveBeenCalledOnce();
    });

    it('does not mark a prize claimed during an RPC error', async () => {
        mocks.solana.verify_claim_tx.mockRejectedValueOnce(new Error('RPC unavailable'));
        await confirm().expect(500);
        expect(mocks.claim.update).not.toHaveBeenCalled();
    });
});
