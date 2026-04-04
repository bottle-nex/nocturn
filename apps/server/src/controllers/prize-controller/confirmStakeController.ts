import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { solanaServiceInstance } from '../../services/init.services';
import { Currency } from '@nocturn/types';

export default async function confirmStakeController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;
    const { txSignature, escrowPda, quizAccountPda, hostWalletPubkey } = req.body as {
        txSignature: string;
        escrowPda: string;
        quizAccountPda: string;
        hostWalletPubkey: string;
    };

    if (!quizId || !txSignature || !escrowPda || !quizAccountPda || !hostWalletPubkey) {
        ResponseWriter.invalid_data(res, 'All fields are required');
        return;
    }

    try {
        const quiz = await prisma.quiz.findFirst({
            where: { id: quizId, hostId: req.user.id },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'Quiz not found');
            return;
        }

        if (quiz.escrowPda) {
            ResponseWriter.error(
                res,
                'ALREADY_STAKED',
                'Quiz already has an active stake',
                undefined,
                409,
            );
            return;
        }

        const isValid = await solanaServiceInstance.verify_stake_tx(txSignature, escrowPda);
        if (!isValid.valid) {
            ResponseWriter.error(
                res,
                'INVALID_TX',
                'Transaction verification failed',
                undefined,
                400,
            );
            return;
        }

        const updated = await prisma.quiz.update({
            where: { id: quizId },
            data: {
                escrowPda,
                quizAccountPda,
                onChainTxSignature: txSignature,
                hostWalletPubkey,
                prizePool: isValid.baseUnits ? Number(isValid.baseUnits) / 1e6 : quiz.prizePool,
                currency: Currency.USDC,
            },
        });

        ResponseWriter.success(res, updated, 'Stake confirmed');
    } catch (error) {
        console.error('Failed to confirm stake:', error);
        ResponseWriter.system_error(res);
    }
}
