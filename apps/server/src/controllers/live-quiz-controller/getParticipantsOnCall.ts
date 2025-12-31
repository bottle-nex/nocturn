import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';

export default async function getParticipantsOnCall(req: Request, res: Response) {
    const { quizId } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const limit = 18;

    if (!quizId) {
        res.status(500).json({ message: 'Quiz-Id not found' });
        return;
    }

    try {
        const totalParticipants = await prisma.participant.count({
            where: { quizId },
        });

        const participants = await prisma.participant.findMany({
            where: { quizId },
            select: {
                id: true,
                avatar: true,
                nickname: true,
            },
            // orderBy: {

            // },
            skip: page + limit,
            take: limit + 1,
        });

        const hasMore = (page + 1) * limit < totalParticipants;

        res.status(201).json({
            success: true,
            participants,
            hasMore,
            message: 'Participants fetched successfully',
        });
        return;
    } catch (error) {
        console.error('Error in fetching participants: ', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching spectators',
        });
        return;
    }
}
