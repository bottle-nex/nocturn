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

    if (!quizId || !txSignature) {
        ResponseWriter.invalid_data(res, 'Quiz ID and transaction signature are required');
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
        const isValid = await solanaServiceInstance.verify_transaction(txSignature);
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

        if (quiz.prizeClaims.length === 0) {
            ResponseWriter.invalid_data(
                res,
                'No prize claims found. Quiz results must be completed first.',
            );
            return;
        }

        // Enqueue finalization job
        await prizeQueueInstance.enqueue_finalization({
            quizId,
            quizAccountPda: quiz.quizAccountPda,
            escrowPda: quiz.escrowPda,
            hostWalletPubkey: quiz.hostWalletPubkey || '',
            claims: quiz.prizeClaims.map((claim) => ({
                id: claim.id,
                claimToken: claim.claimToken,
                emailHash: claim.emailHash,
                amountBaseUnits: claim.amountBaseUnits.toString(),
                rank: claim.rank,
                participantEmail: claim.participant.email || '',
                participantName: claim.participant.nickname,
                expiresAt: claim.expiresAt.toISOString(),
            })),
            quizTitle: quiz.title,
        });

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
