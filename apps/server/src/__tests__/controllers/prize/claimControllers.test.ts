import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import getClaimController from '../../../controllers/prize-controller/getClaimController';
import confirmClaimController from '../../../controllers/prize-controller/confirmClaimController';
import { hashClaimToken } from '../../../utils/claim-token';

const { findUnique, update, verify } = vi.hoisted(() => ({
    findUnique: vi.fn(),
    update: vi.fn(),
    verify: vi.fn(),
}));
vi.mock('@nocturn/database', () => ({ prisma: { prizeClaim: { findUnique, update } } }));
vi.mock('../../../services/init.services', () => ({
    solanaServiceInstance: { verify_transaction: verify },
}));

const app = express();
app.use(express.json());
app.get('/claim/:token', getClaimController);
app.post('/claim/:token/confirm', confirmClaimController);

describe('claim credential lookup', () => {
    beforeEach(() => vi.resetAllMocks());

    it('hashes the emailed secret before looking up claim details', async () => {
        findUnique.mockResolvedValue(null);
        await request(app).get('/claim/secret-token').expect(404);
        expect(findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { claimTokenHash: hashClaimToken('secret-token') },
            }),
        );
    });

    it('rejects an unknown secret without verifying or updating a payout', async () => {
        findUnique.mockResolvedValue(null);
        await request(app)
            .post('/claim/wrong-token/confirm')
            .send({
                txSignature: 'transaction',
                claimerWallet: 'wallet',
            })
            .expect(404);
        expect(findUnique).toHaveBeenCalledWith({
            where: { claimTokenHash: hashClaimToken('wrong-token') },
        });
        expect(verify).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });

    it('confirms a pending claim found by its hash', async () => {
        findUnique.mockResolvedValue({
            id: 'claim',
            status: 'PENDING',
            expiresAt: new Date('2099-01-01'),
        });
        verify.mockResolvedValue(true);
        update.mockResolvedValue({ id: 'claim', status: 'CLAIMED', txSignature: 'transaction' });
        await request(app)
            .post('/claim/secret-token/confirm')
            .send({
                txSignature: 'transaction',
                claimerWallet: 'wallet',
            })
            .expect(200);
        expect(findUnique).toHaveBeenCalledWith({
            where: { claimTokenHash: hashClaimToken('secret-token') },
        });
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'claim' } }));
    });
});
