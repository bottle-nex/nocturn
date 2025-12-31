import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';

export default async function getAllQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        res.status(401).json({
            success: false,
            message: 'User authentication required',
        });
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

        res.status(200).json({
            success: true,
            message: 'Quizzes retrieved successfully',
            quizzes,
        });
        return;
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching quizzes',
        });
        return;
    }
}
