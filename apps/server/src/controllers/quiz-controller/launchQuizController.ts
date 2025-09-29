import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import { USER_TYPE } from '../../types/web-socket-types';
import { quizControllerInstance } from '../../services/init-services';
import { QUIZ_STATUS } from './quizController';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { env } from '../../configs/env';

export default async function launchQuizController(req: Request, res: Response) {
    const userId = req.user?.id;
    const quizId = req.params.quizId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'User authentication required',
        });
        return;
    }
    if (!quizId) {
        res.status(400).json({
            success: false,
            message: 'Quiz ID is required',
        });
        return;
    }

    const parsed = createQuizSchema.safeParse(req.body);
    if (!parsed.success) {
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
        const data = await quizControllerInstance.update_quiz_status(
            QUIZ_STATUS.LAUNCH_QUIZ,
            quizId,
            input,
            questions,
            userId,
        );

        if (
            !data ||
            data.error ||
            !data.quiz ||
            data.type !== QUIZ_STATUS.LAUNCH_QUIZ ||
            !data.gameSession
        ) {
            console.error('Error publishing quiz:', data?.error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
            return;
        }

        const prev_status = data.status;

        if (prev_status === 'LIVE') {
            res.status(400).json({
                success: false,
                message: 'Quiz is already live',
            });
            return;
        }

        const secureTokenData = QuizAction.generateUserToken(
            String(userId),
            quizId,
            data.gameSession.id!,
            USER_TYPE.HOST,
        );

        res.cookie('token', secureTokenData, {
            httpOnly: true,
            secure: env.SERVER_NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1000,
        });

        res.status(200).json({
            success: true,
            message: 'Quiz launched successfully',
            data: {
                quiz: data.quiz,
                gameSession: data.gameSession,
            },
        });
        return;
    } catch (err) {
        console.error('Error launching quiz:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
