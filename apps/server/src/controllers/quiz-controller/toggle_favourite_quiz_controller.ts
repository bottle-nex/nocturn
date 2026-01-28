import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { favouriteQuizSchema } from '../../schemas/favouriteQuizSchema';
import { prisma } from '@nocturn/database';

export default async function toggle_favourite_quiz_controller(req: Request, res: Response) {
    if (!req.user?.id) {
        console.log('unauthorized');
        ResponseWriter.not_authorized(res);
        return;
    }

    const { success, data } = favouriteQuizSchema.safeParse(req.body);
    if (!success) {
        ResponseWriter.invalid_data(res);
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: data.quizId,
                hostId: req.user?.id,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res);
            return;
        }

        const updatedQuiz = await prisma.quiz.update({
            where: {
                id: data.quizId,
                hostId: req.user?.id,
            },
            data: {
                isFavourite: data.isFavourite,
            },
        });

        ResponseWriter.success(
            res,
            updatedQuiz,
            data.isFavourite ? 'Added quiz to favourite' : 'Removed quiz from faviorutes',
        );
        return;
    } catch (error) {
        console.error('Favourite toggle failed: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
