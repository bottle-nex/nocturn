import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { solanaServiceInstance, prizeQueueInstance } from '../../services/init.services';

export default async function getPrizeClaimsController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;

    if (!quizId) {
        ResponseWriter.invalid_data(res, 'Quiz ID is required');
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

        const claims = await prisma.prizeClaim.findMany({
            where: { quizId },
            include: {
                participant: {
                    select: { nickname: true, avatar: true, email: true },
                },
            },
            orderBy: { rank: 'asc' },
        });

        const serializedClaims = [];
        for (const claim of claims) {
            const settlement = await solanaServiceInstance.reconcile_claim(
                quizId,
                claim.claimToken,
                quiz.hostWalletPubkey || '',
                claim.amountBaseUnits,
            );
            await prisma.prizeClaim.updateMany({
                where: { id: claim.id, updatedAt: claim.updatedAt },
                data: settlement,
            });
            serializedClaims.push({
                id: claim.id,
                rank: claim.rank,
                amount: claim.amount,
                amountBaseUnits: claim.amountBaseUnits.toString(),
                participant: claim.participant,
                ...settlement,
                payoutStatus: quiz.payoutError
                    ? 'FAILED'
                    : quiz.payoutSealedAt
                      ? 'COMPLETED'
                      : 'PROCESSING',
                payoutError: quiz.payoutError,
            });
        }

        const chainQuiz = await solanaServiceInstance.fetch_quiz(
            quizId,
            quiz.hostWalletPubkey || '',
        );
        if (
            quiz.payoutPreparedAt &&
            !quiz.payoutSealedAt &&
            !quiz.payoutError &&
            chainQuiz.platformAuthority.equals(solanaServiceInstance.platformPublicKey)
        ) {
            // Recover an approved transaction whose HTTP confirmation was lost.
            await prizeQueueInstance.enqueue_finalization({ quizId });
        }
        ResponseWriter.success(res, {
            claims: serializedClaims,
            authorized: chainQuiz.platformAuthority.equals(solanaServiceInstance.platformPublicKey),
            status: quiz.payoutError
                ? 'FAILED'
                : quiz.payoutSealedAt
                  ? 'COMPLETED'
                  : chainQuiz.platformAuthority.equals(solanaServiceInstance.platformPublicKey)
                    ? 'PROCESSING'
                    : 'AWAITING_APPROVAL',
            error: quiz.payoutError,
        });
    } catch (error) {
        console.error('Failed to get prize claims:', error);
        ResponseWriter.system_error(res);
    }
}
