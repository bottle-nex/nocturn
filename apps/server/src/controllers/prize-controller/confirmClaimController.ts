import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { solanaServiceInstance } from '../../services/init.services';

export default async function confirmClaimController(req: Request, res: Response) {
    const { token } = req.params;
    const { txSignature, claimerWallet } = req.body as {
        txSignature: string;
        claimerWallet: string;
    };

    if (!token || !txSignature || !claimerWallet) {
        ResponseWriter.invalid_data(
            res,
            'Token, transaction signature, and claimer wallet are required',
        );
        return;
    }

    try {
        const claim = await prisma.prizeClaim.findUnique({
            where: { claimToken: token },
            include: { quiz: true },
        });

        if (!claim) {
            ResponseWriter.not_found(res, 'Claim not found');
            return;
        }

        const isValid = await solanaServiceInstance.verify_claim_tx(
            txSignature,
            claim.quizId,
            claim.claimToken,
            claim.quiz.hostWalletPubkey || '',
            claimerWallet,
            claim.amountBaseUnits,
        );
        if (!isValid) {
            ResponseWriter.error(
                res,
                'INVALID_TX',
                'Transaction verification failed',
                undefined,
                400,
            );
            return;
        }

        // Update claim status
        const updated = await prisma.prizeClaim.update({
            where: { id: claim.id },
            data: {
                status: 'CLAIMED',
                claimedAt: isValid.claimedAt,
                claimerWallet,
                txSignature,
            },
        });

        ResponseWriter.success(
            res,
            {
                id: updated.id,
                status: updated.status,
                claimedAt: updated.claimedAt,
                txSignature: updated.txSignature,
            },
            'Prize claimed successfully',
        );
    } catch (error) {
        console.error('Failed to confirm claim:', error);
        ResponseWriter.system_error(res);
    }
}
