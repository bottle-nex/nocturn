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
                        description: true,
                        prizePool: true,
                        currency: true,
                        status: true,
                        hostWalletPubkey: true,
                        startedAt: true,
                        endedAt: true,
                        createdAt: true,
                        host: {
                            select: { name: true, image: true },
                        },
                        _count: {
                            select: { participants: true, questions: true },
                        },
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
            quizDescription: claim.quiz.description,
            quizStatus: claim.quiz.status,
            quizStartedAt: claim.quiz.startedAt,
            quizEndedAt: claim.quiz.endedAt,
            quizCreatedAt: claim.quiz.createdAt,
            quizHostName: claim.quiz.host.name,
            quizHostAvatar: claim.quiz.host.image,
            quizParticipantCount: claim.quiz._count.participants,
            quizQuestionCount: claim.quiz._count.questions,
            totalPrizePool: claim.quiz.prizePool,
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
