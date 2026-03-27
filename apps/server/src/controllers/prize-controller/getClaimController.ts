import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getClaimController(req: Request, res: Response) {
    const { token } = req.params;

    if (!token) {
        ResponseWriter.invalid_data(res, 'Claim token is required');
        return;
    }

    try {
        const claim = await prisma.prizeClaim.findUnique({
            where: { claimToken: token },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        prizePool: true,
                        currency: true,
                        hostWalletPubkey: true,
                    },
                },
                participant: {
                    select: { nickname: true, avatar: true },
                },
            },
        });

        if (!claim) {
            ResponseWriter.not_found(res, 'Claim not found');
            return;
        }

        // Return public claim data (no sensitive info)
        ResponseWriter.success(res, {
            id: claim.id,
            quizId: claim.quiz.id,
            quizTitle: claim.quiz.title,
            currency: claim.quiz.currency,
            hostWalletPubkey: claim.quiz.hostWalletPubkey,
            participantName: claim.participant.nickname,
            participantAvatar: claim.participant.avatar,
            rank: claim.rank,
            amount: claim.amount,
            amountBaseUnits: claim.amountBaseUnits.toString(),
            status: claim.status,
            claimedAt: claim.claimedAt,
            claimerWallet: claim.claimerWallet,
            txSignature: claim.txSignature,
            expiresAt: claim.expiresAt,
        });
    } catch (error) {
        console.error('Failed to get claim:', error);
        ResponseWriter.system_error(res);
    }
}
