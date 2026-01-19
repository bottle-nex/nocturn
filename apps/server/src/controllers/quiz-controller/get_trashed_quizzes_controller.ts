import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function get_trashed_quizzes_controller(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const trashedQuizzes = await prisma.quiz.findMany({
            where: {
                id: String(req.user.id),
                isDeleted: true,
            },
            orderBy: {
                deletedAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                description: true,
                prizePool: true,
                theme: true,
                currency: true,
                status: true,
                scheduledAt: true,
                createdAt: true,
            },
        });

        if (!trashedQuizzes || trashedQuizzes.length === 0) {
            ResponseWriter.not_found(res, 'No quizzes foudn');
            return;
        }

        ResponseWriter.success(res, trashedQuizzes, 'Fetched trashed quizzes successfully');
        return;
    } catch (err) {
        console.error('Error fetching trashed quizzes ', err);
        ResponseWriter.system_error(res);
        return;
    }
}

// delete one trashed quiz
// delete all trashed quizzes

// move to trash
// directly delete
