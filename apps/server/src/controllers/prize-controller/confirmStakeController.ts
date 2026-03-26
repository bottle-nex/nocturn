import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { solanaServiceInstance } from '../../services/init.services';

export default async function confirmStakeController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;
    const { txSignature, escrowPda, quizAccountPda } = req.body as {
        txSignature: string;
        escrowPda: string;
        quizAccountPda: string;
    };

    if (!quizId || !txSignature || !escrowPda || !quizAccountPda) {
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

        // Verify the transaction on-chain
        const isValid = await solanaServiceInstance.verify_transaction(txSignature);
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

        // Update quiz with on-chain data
        const updated = await prisma.quiz.update({
            where: { id: quizId },
            data: {
                escrowPda,
                quizAccountPda,
                onChainTxSignature: txSignature,
            },
        });

        ResponseWriter.success(res, updated, 'Stake confirmed');
    } catch (error) {
        console.error('Failed to confirm stake:', error);
        ResponseWriter.system_error(res);
    }
}
