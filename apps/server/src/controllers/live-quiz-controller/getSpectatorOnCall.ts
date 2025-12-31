import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';

export default async function getSpectatorOnCall(req: Request, res: Response) {
    const { quizId } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const limit = 18;

    if (!quizId) {
        res.status(400).json({ message: 'Quiz-Id not found' });
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

        res.status(201).json({
            success: true,
            spectators,
            hasMore,
            message: 'Spectators fetched successfully',
        });
        return;
    } catch (error) {
        console.error('Error in fetching spectators: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching spectators',
        });
        return;
    }
}
