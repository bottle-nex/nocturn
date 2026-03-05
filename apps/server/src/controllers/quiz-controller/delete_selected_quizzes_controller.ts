import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function delete_selected_quizzes_controller(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizIds } = req.body;

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
        ResponseWriter.invalid_data(res);
        return;
    }

    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                id: {
                    in: quizIds,
                },
                hostId: String(req.user.id),
            },
        });

        if (quizzes.length === 0) {
            ResponseWriter.not_found(res);
            return;
        }

        const deletatbleQuizzes = quizzes.filter((quiz) => !quiz.isDeleted);

        if (deletatbleQuizzes.length === 0) {
            ResponseWriter.not_found(res);
            return;
        }

        const result = await prisma.quiz.updateMany({
            where: {
                id: { in: deletatbleQuizzes.map((q) => q.id) },
                hostId: String(req.user.id),
                isDeleted: false,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        ResponseWriter.success(
            res,
            { deleted_length: result.count },
            result.count > 0 ? 'Deleted quizzes successfully' : 'No quizzes were deleted',
        );
        return;
    } catch (err) {
        console.error('Failed to delete seleced quizzes: ', err);
        ResponseWriter.system_error(res);
        return;
    }
}
