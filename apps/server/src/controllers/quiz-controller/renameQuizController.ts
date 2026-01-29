import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { renameQuizSchema } from '../../schemas/renameQuizSchema';
import { prisma } from '@nocturn/database';

export default async function renameQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { success, data } = renameQuizSchema.safeParse(req.body);
    if (!success) {
        ResponseWriter.invalid_data(res);
        return;
    }

    try {
        const quiz = await prisma.quiz.findMany({
            where: {
                id: data.quizId,
                hostId: req.user.id,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res);
            return;
        }

        await prisma.quiz.update({
            where: {
                id: data.quizId,
                hostId: req.user.id,
            },
            data: {
                title: data.name,
            },
        });

        ResponseWriter.success(res, {}, 'Quiz title updated successfully');
        return;
    } catch (error) {
        console.error('Error in updating quiz title: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
