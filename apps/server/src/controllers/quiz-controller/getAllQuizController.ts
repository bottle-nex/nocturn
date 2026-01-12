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

        const recentlyViewed = await prisma.quizViews.findMany({
            where: {
                userId: String(req.user.id),
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        prizePool: true,
                        currency: true,
                        status: true,
                        scheduledAt: true,
                        createdAt: true,
                        theme: true,
                        host: {
                            select: {
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                viewedAt: 'desc',
            },
            take: 4,
        });

        if (!quizzes || quizzes.length === 0) {
            ResponseWriter.not_found(res, 'No quizzes found');
            return;
        }

        const data = {
            recentlyViewed,
            quizzes,
        };

        ResponseWriter.success(res, data, 'Quizzes retrieved successfully');
        return;
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        ResponseWriter.system_error(res);
        return;
    }
}
