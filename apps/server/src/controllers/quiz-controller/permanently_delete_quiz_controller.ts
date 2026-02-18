import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import ResponseWriter from '../../class/response_writer';

export default async function permanently_delete_quiz_controller(req: Request, res: Response) {
    const quizId = req.params.quizId;
    const userId = req.user?.id;

    if (!userId) {
        ResponseWriter.not_authorized(res);
        return;
    }
    if (!quizId) {
        ResponseWriter.invalid_data(res, 'quiz id is required');
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                isDeleted: true,
            },
            select: {
                id: true,
                status: true,
                title: true,
                description: true,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, "quiz doesn't exist or already deleted");
            return;
        }

        QuizAction.permanentDeleteQuiz(quizId, String(userId));
        ResponseWriter.success(res, quiz, 'Quiz deleted successfully');
        return;
    } catch {
        ResponseWriter.system_error(res);
        return;
    }
}
