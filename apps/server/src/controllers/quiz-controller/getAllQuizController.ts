import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export default async function getAllQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res, 'User authentication required');
        return;
    }

    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                hostId: String(req.user.id),
            },
            select: {
                id: true,
                title: true,
                description: true,
                prizePool: true,
                currency: true,
                status: true,
                scheduledAt: true,
                createdAt: true,
            },
        });

        if (!quizzes || quizzes.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No quizzes found',
                quizzes: [],
            });
            return;
        }

        ResponseWriter.success(res, quizzes, 'Quizzes retrieved successfully');
        return;
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        ResponseWriter.system_error(res);
        return;
    }
}
