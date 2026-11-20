import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { solanaServiceInstance, prizeQueueInstance } from '../../services/init.services';

export default async function authorizeConfirmController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;
    const { txSignature } = req.body as { txSignature: string };

    if (!quizId) {
        ResponseWriter.invalid_data(res, 'Quiz ID is required');
        return;
    }

    try {
        const quiz = await prisma.quiz.findFirst({
            where: { id: quizId, hostId: req.user.id },
            include: {
                prizeClaims: {
                    include: { participant: true },
                },
                prizeDistributions: true,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'Quiz not found');
            return;
        }

        if (!quiz.escrowPda || !quiz.quizAccountPda) {
            ResponseWriter.invalid_data(res, 'Quiz has not been staked on-chain');
            return;
        }

        // Verify the authorize_platform transaction
        const isValid = await solanaServiceInstance.verify_authorization_tx(
            txSignature,
            quizId,
            quiz.hostWalletPubkey || '',
        );
        if (!isValid) {
            ResponseWriter.error(
                res,
                'INVALID_TX',
                'Authorization transaction verification failed',
                undefined,
                400,
            );
            return;
        }

        if (!quiz.payoutPreparedAt) {
            ResponseWriter.invalid_data(res, 'Quiz results must be completed first');
            return;
        }
        await prizeQueueInstance.enqueue_finalization({ quizId });

        ResponseWriter.success(
            res,
            { status: 'FINALIZATION_QUEUED' },
            'Prize finalization started',
        );
    } catch (error) {
        console.error('Failed to confirm authorization:', error);
        ResponseWriter.system_error(res);
    }
}
