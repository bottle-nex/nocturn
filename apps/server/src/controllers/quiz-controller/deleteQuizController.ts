import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma, QuizStatus } from '@nocturn/database';
import QuizAction from '../../class/quizAction';

export default async function deleteQuizController(req: Request, res: Response) {
    const quizId = req.params.quizId;
    const userId = req.user?.id;

    if (!userId) {
        ResponseWriter.not_authorized(res);
        return;
    }

    if (!quizId) {
        ResponseWriter.not_found(res, 'quiz id not found');
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                hostId: String(userId),
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'Quiz does not exist');
            return;
        }

        if (quiz.isDeleted) {
            ResponseWriter.invalid_data(res, 'Cant delete an already deleted quiz');
            return;
        }

        // if (quiz.status === QuizStatus.LIVE) {
        //     ResponseWriter.success(res, quiz.id, 'CANNOT_DELETE_ONGOING_QUIZ', 200);
        //     return;
        // }

        await QuizAction.moveToTrash(quizId, String(userId));
        ResponseWriter.success(res, quiz.id, 'Quiz moved to trash successfully');
        return;
    } catch (error) {
        console.error('error in deleting quiz: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
