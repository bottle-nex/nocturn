import { Request, Response } from 'express';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { quizControllerInstance } from '../../services/init.services';
import { QUIZ_STATUS } from './quizController';
import ResponseWriter from '../../class/response_writer';

export default async function upsertQuizController(req: Request, res: Response) {
    const { quizId } = req.params;

    if (!quizId) {
        ResponseWriter.invalid_data(res, 'Invalid quizId');
        return;
    }

    console.log('DATA FROM FRONTEND IS ---------------------------------> ', req.body);

    const parsed = createQuizSchema.safeParse(req.body);
    console.log(
        'PARSED DATA IS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::>',
        parsed,
    );
    if (!parsed.success) {
        ResponseWriter.invalid_data(res, 'Error while creating quiz');
        return;
    }

    const input = parsed.data;
    const hostId = req.user?.id;
    const questions = input.questions;

    if (!hostId) {
        ResponseWriter.not_authorized(res, 'Unauthorized');
        return;
    }

    console.log('data from FRONTEND IS: ', parsed.data);

    try {
        const data = await quizControllerInstance.update_quiz_status(
            QUIZ_STATUS.SAVE_NEW_QUIZ,
            quizId,
            input,
            questions,
            hostId,
        );

        if (!data || !data.success || data.error || !data.quiz) {
            console.error('[CREATE_QUIZ_ERROR] ', data?.error);
            ResponseWriter.system_error(res);
            return;
        }

        ResponseWriter.created(res, data.quiz, 'Quiz created successfully');
        return;
    } catch (err) {
        console.error('[CREATE_QUIZ_ERROR] ', err);
        ResponseWriter.system_error(res);
        return;
    }
}
