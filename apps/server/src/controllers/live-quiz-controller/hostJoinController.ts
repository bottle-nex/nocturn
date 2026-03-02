import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { NOCTURN_COOKIE_NAME, QuizStatusEnum, USER_TYPE } from '@nocturn/types';
import { env } from '../../configs/env';
import QuizAction from '../../class/quizAction';

// this should only be called when the quiz is already launched
export default async function HostJoinController(req: Request, res: Response) {
    try {

        const user = req.user;
        if (!user || !user.id) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const quizId = req.body.quizId;
        if (!quizId) {
            ResponseWriter.invalid_data(res, 'quiz id not provided');
            return;
        }

        const { quiz, gameSession } = await prisma.$transaction(async (tx) => {

            const quiz = await tx.quiz.findUnique({
                where: {
                    id: quizId,
                },
            });

            const gameSession = await tx.gameSession.findUnique({
                where: {
                    quizId: quizId,
                },
            });

            return {
                quiz,
                gameSession,
            };
        })

        if (!quiz) {
            ResponseWriter.not_found(res, 'quiz not found');
            return;
        }

        if (quiz.hostId !== user.id) {
            ResponseWriter.not_authorized(res, "you're not authorized to access this quiz");
            return;
        }

        if (!gameSession || quiz.status !== QuizStatusEnum.LIVE) {
            ResponseWriter.error(
                res,
                'QUIZ_NOT_LIVE',
                'quiz is not live',
                undefined,
                422,
            );
            return;
        }

        const token = QuizAction.generateLiveGameToken(
            String(user.id),
            quizId,
            gameSession.id!,
            USER_TYPE.HOST,
            req.user?.name,
        );

        res.cookie(NOCTURN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: env.SERVER_NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1000,
        });

        return ResponseWriter.success(
            res,
            { quiz, gameSession },
            'Quiz launched successfully',
            200,
        );

    } catch (error) {
        console.error('error in host join controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
