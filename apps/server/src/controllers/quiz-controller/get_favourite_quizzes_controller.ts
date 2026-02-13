import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function get_favourite_quizzes_controller(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                hostId: req.user.id,
                isFavourite: true,
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
                host: {
                    select: {
                        image: true,
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
        });

        if (!quizzes) {
            ResponseWriter.not_found(res);
            return;
        }

        ResponseWriter.success(res, quizzes, 'Fetched favourite quizzes successfully');
        return;
    } catch (err) {
        console.error('Error in fetching favourite quizzes: ', err);
        ResponseWriter.system_error(res);
        return;
    }
}
