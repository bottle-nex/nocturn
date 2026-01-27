import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function remove_quiz_from_favourites_controller(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const quizId = req.params;
    if (!quizId) {
        ResponseWriter.not_found(res);
        return;
    }

    try {
        const quiz = await prisma.quiz.findMany({
            where: {
                id: quizId,
                hostId: req.user.id,
                isFavourite: true,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res);
            return;
        }

        const updatedQuiz = await prisma.quiz.update({
            where: {
                id: String(quizId),
            },
            data: {
                isFavourite: false,
            },
        });

        console.log('updated quiz is: ', updatedQuiz);

        ResponseWriter.success(res, updatedQuiz, 'Removed quiz from favourites');
        return;
    } catch (error) {
        console.error('Removed quiz from favourites: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
