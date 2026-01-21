import { Request, Response } from 'express';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { quizControllerInstance } from '../../services/init.services';
import { QUIZ_STATUS } from './quizController';
import ResponseWriter from '../../class/response_writer';

export default async function publishQuizController(req: Request, res: Response) {
    const userId = req.user?.id;
    const quizId = req.params.quizId;

    if (!userId) {
        ResponseWriter.not_authorized(res, 'User authentication required');
        return;
    }

    if (!quizId) {
        ResponseWriter.invalid_data(res, 'Quiz ID is required');
        return;
    }

    const parsed = createQuizSchema.safeParse(req.body);
    if (!parsed.success) {
        ResponseWriter.invalid_data(res, 'Error while creating quiz');
        return;
    }

    const input = parsed.data;
    const questions = input.questions;

    const data = await quizControllerInstance.update_quiz_status(
        QUIZ_STATUS.PUBLISH_QUIZ,
        quizId,
        input,
        questions,
        userId,
    );

    if (!data || data.error || !data.quiz) {
        console.error('Error publishing quiz:', data?.error);
        ResponseWriter.system_error(res);
        return;
    }

    const quiz = data.quiz;
    let prev_status;

    if (data.type === QUIZ_STATUS.PUBLISH_QUIZ) {
        prev_status = data.status;
    }

    if (prev_status === 'PUBLISHED') {
        ResponseWriter.custom(
            res,
            false,
            'QUIZ_ALREADY_PUBLISHED',
            'Quiz is already published',
            400,
        );
        return;
    }

    if (quiz.status === 'LIVE') {
        ResponseWriter.custom(res, false, 'QUIZ_ALREADY_LIVE', 'Quiz is live', 400);
        return;
    }

    try {
        ResponseWriter.success(res, quiz, 'Quiz published successfully', 200);
        return;
    } catch (err) {
        console.error('Error publishing quiz:', err);
        ResponseWriter.system_error(res);
    }
}
