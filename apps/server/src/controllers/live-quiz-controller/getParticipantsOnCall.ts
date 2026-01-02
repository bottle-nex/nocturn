import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export default async function getParticipantsOnCall(req: Request, res: Response) {
    const { quizId } = req.params;
    const page = parseInt(req.query.page as string) || 0;
    const limit = 18;

    if (!quizId) {
        ResponseWriter.invalid_data(res, 'quiz-id not found');
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

        // here participants and hasMore are on different vars, merge theme and integrate with client too
        res.status(201).json({
            success: true,
            participants,
            hasMore,
            message: 'Participants fetched successfully',
        });
        return;
    } catch (error) {
        console.error('Error in fetching participants: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
