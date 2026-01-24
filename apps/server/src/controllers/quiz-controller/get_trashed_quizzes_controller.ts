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
                hostId: String(req.user.id),
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
                deletedAt: true,
                host: {
                    select: {
                        image: true,
                        name: true,
                    },
                },
            },
        });

        const now = new Date();
        const MAX_TRASH_DAYS = 30;

        const quizzesWithDaysLeft = trashedQuizzes.map((quiz) => {
            let daysLeft: number | null = null;

            if (quiz.deletedAt) {
                const deletedAt = new Date(quiz.deletedAt);
                const diffMs = now.getTime() - deletedAt.getTime();
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                const remaining = MAX_TRASH_DAYS - diffDays;

                daysLeft = Math.max(0, Math.ceil(remaining));
            }

            return {
                ...quiz,
                daysLeftUntilPermanentDeletion: daysLeft,
            };
        });

        ResponseWriter.success(res, quizzesWithDaysLeft, 'Fetched trashed quizzes successfully');
        return;
    } catch (err) {
        console.error('Error fetching trashed quizzes ', err);
        ResponseWriter.system_error(res);
        return;
    }
}
