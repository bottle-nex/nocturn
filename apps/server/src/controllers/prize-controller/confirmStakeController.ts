import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { solanaServiceInstance } from '../../services/init.services';
import { consume_prize_transaction, prize_confirmation_error } from './prizeTransaction';
import { Currency } from '@nocturn/types';

export default async function confirmStakeController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;
    const { txSignature, hostWalletPubkey } = req.body as {
        txSignature: string;
        hostWalletPubkey: string;
    };

    if (!quizId || !txSignature || !hostWalletPubkey) {
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

        const amount = Math.floor(quiz.prizePool * 1e6);
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            ResponseWriter.invalid_data(res, 'Quiz must have a positive prize pool');
            return;
        }
        const isValid = await solanaServiceInstance.verify_stake_tx(
            txSignature,
            quizId,
            req.user.id,
            hostWalletPubkey,
            BigInt(amount),
        );
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

        const updated = await prisma.$transaction(async (tx) => {
            await consume_prize_transaction(tx, txSignature, 'STAKE', quizId);
            return tx.quiz.update({
                where: { id: quizId, escrowPda: null },
                data: {
                    escrowPda: isValid.escrowPda,
                    quizAccountPda: isValid.quizAccountPda,
                    onChainTxSignature: txSignature,
                    hostWalletPubkey,
                    prizePool: Number(isValid.baseUnits) / 1e6,
                    currency: Currency.USDC,
                },
            });
        });

        ResponseWriter.success(res, updated, 'Stake confirmed');
    } catch (error) {
        if (prize_confirmation_error(res, error)) return;
        console.error('Failed to confirm stake:', error);
        ResponseWriter.system_error(res);
    }
}
