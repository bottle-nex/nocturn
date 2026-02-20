import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export default async function getAllQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res, 'User authentication required');
        return;
    }
    //

    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                hostId: String(req.user.id),
                isDeleted: false,
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
                template: true,
                isFavourite: true,
                host: {
                    select: {
                        image: true,
                        name: true,
                    },
                },
                questions: {
                    take: 1,
                    orderBy: {
                        orderIndex: 'asc',
                    },
                    select: {
                        question: true,
                        options: true,
                    },
                },
            },
            take: 20,
        });

        console.log('quizzes to return : ', quizzes);

        if (!quizzes || quizzes.length === 0) {
            ResponseWriter.success(res, [], 'No quizzes found');
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
