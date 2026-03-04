import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import QuizAction from '../../class/quizAction';

export default async function restore_trashed_quiz_controller(req: Request, res: Response) {
    const quizId = req.params.quizId;
    const userId = req.user?.id;

    if (!userId) {
        ResponseWriter.not_authorized(res);
        return;
    }

    if (!quizId) {
        ResponseWriter.not_found(res, 'Quiz Id not found');
        return;
    }

    try {
        const quiz = await prisma.quiz.findFirst({
            where: {
                id: quizId,
                hostId: String(userId),
            },
            include: {
                questions: {
                    take: 1,
                    select: {
                        id: true,
                        question: true,
                        options: true,
                    },
                },
                template: true,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'Quiz does not exist');
            return;
        }

        if (!quiz.isDeleted) {
            ResponseWriter.invalid_data(res, 'Cant restore an existing quiz');
            return;
        }

        await QuizAction.restoreQuiz(quizId);
        ResponseWriter.success(res, quiz, 'Quiz restored successfully');
        return;
    } catch (error) {
        console.error('Error in restoring quiz', error);
        ResponseWriter.system_error(res);
        return;
    }
}
