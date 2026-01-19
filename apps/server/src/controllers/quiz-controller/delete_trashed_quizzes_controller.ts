import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function delete_trashed_quizzes_controller(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const trashedQuizzes = await prisma.quiz.deleteMany({
            where: {
                hostId: String(req.user.id),
                isDeleted: true,
            },
        });

        ResponseWriter.success(res, trashedQuizzes.count, 'Cleared trash successfully');
        return;
    } catch (error) {
        console.error('Error in clearing trash: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
