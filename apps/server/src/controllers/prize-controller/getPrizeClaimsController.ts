import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

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

        // Serialize BigInt to string for JSON response
        const serializedClaims = claims.map((claim) => ({
            ...claim,
            amountLamports: claim.amountLamports.toString(),
        }));

        ResponseWriter.success(res, serializedClaims);
    } catch (error) {
        console.error('Failed to get prize claims:', error);
        ResponseWriter.system_error(res);
    }
}
