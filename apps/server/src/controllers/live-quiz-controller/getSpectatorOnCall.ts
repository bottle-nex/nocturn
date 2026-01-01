import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export default async function getSpectatorOnCall(req: Request, res: Response) {
    const { quizId } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const limit = 18;

    if (!quizId) {
        ResponseWriter.not_found(res, 'quiz-id not found');
        return;
    }

    try {
        const totalSpectators = await prisma.spectator.count({
            where: { quizId },
        });

        const spectators = await prisma.spectator.findMany({
            where: {
                quizId,
            },
            select: {
                id: true,
                nickname: true,
                avatar: true,
            },
            orderBy: {
                joinedAt: 'asc',
            },
            skip: page * limit,
            take: limit + 1,
        });

        const hasMore = (page + 1) * limit < totalSpectators;

        // two args of data
        res.status(201).json({
            success: true,
            spectators,
            hasMore,
            message: 'Spectators fetched successfully',
        });
        return;
    } catch (error) {
        console.error('Error in fetching spectators: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
