import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import { NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import { quizControllerInstance } from '../../services/init.services';
import { QUIZ_STATUS } from './quizController';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';

export default async function launchQuizController(req: Request, res: Response) {
    const userId = req.user?.id;
    const quizId = req.params.quizId;

    if (!userId) {
        ResponseWriter.not_authorized(res, 'User authentication required');
        return;
    }
    if (!quizId) {
        ResponseWriter.invalid_data(res, 'quiz id is required');
        return;
    }

    const parsed = createQuizSchema.safeParse(req.body);
    console.log('parsed is : ', parsed);
    if (!parsed.success) {
        // contains value
        res.status(400).json({
            success: false,
            message: 'Error while creating quiz',
            value: 'INVALID_QUIZ_FORMAT',
        });
        return;
    }

    const input = parsed.data;
    const questions = input.questions;

    try {
        console.log('i am here ');
        const data = await quizControllerInstance.update_quiz_status(
            QUIZ_STATUS.LAUNCH_QUIZ,
            quizId,
            input,
            questions,
            userId,
        );

        console.log('data is : ', data);

        if (
            !data ||
            data.error ||
            !data.quiz ||
            data.type !== QUIZ_STATUS.LAUNCH_QUIZ ||
            !data.gameSession
        ) {
            console.error('Error publishing quiz:', data?.error);
            ResponseWriter.system_error(res);
            return;
        }

        const prev_status = data.status;
        console.log('previous status : ', prev_status);
        if (prev_status === 'LIVE') {
            ResponseWriter.error(res, 'QUIZ_ALREADY_LIVE', 'quiz is already live', undefined, 400);
            return;
        }

        const secureTokenData = QuizAction.generateUserToken(
            String(userId),
            quizId,
            data.gameSession.id!,
            USER_TYPE.HOST,
            req.user.name,
        );
        console.log('secure token data is : ', secureTokenData);

        res.cookie(NOCTURN_COOKIE_NAME, secureTokenData, {
            httpOnly: true,
            secure: env.SERVER_NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1000,
        });

        ResponseWriter.success(
            res,
            {
                quiz: data.quiz,
                gameSession: data.gameSession,
            },
            'quiz launched successfully',
            200,
        );
        return;
    } catch (err) {
        console.error('Error launching quiz:', err);
        ResponseWriter.system_error(res);
        return;
    }
}
