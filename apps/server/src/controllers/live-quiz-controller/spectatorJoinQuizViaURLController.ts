import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import GenerateUser from '../../class/generateUser';
import { redisCacheInstance } from '../../services/init.services';
import QuizAction from '../../class/quizAction';
import { NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';

export default async function spectatorJoinQuizViaURLController(req: Request, res: Response) {
    const redisCache = redisCacheInstance;
    const quizId = req.query.quizId as string;
    const spectatorToken = req.query.spectator_token as string;

    if (!quizId) {
        ResponseWriter.invalid_data(res);
        return;
    }

    if (!spectatorToken) {
        ResponseWriter.invalid_data(res);
        return;
    }

    try {
        const verify_token = QuizAction.verifyCookie(spectatorToken);

        if (!verify_token) {
            ResponseWriter.invalid_data(res, 'Invalid token', 401);
            return;
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
            },
            select: {
                id: true,
                status: true,
            },
        });

        if (!quiz) {
            ResponseWriter.invalid_data(res, 'Invalid quiz code. Please check and try again.', 404);
            return;
        }

        if (!['LIVE'].includes(quiz.status)) {
            ResponseWriter.error(
                res,
                'QUIZ_NOT_LIVE',
                'Quiz is not available for joining at this time.',
                undefined,
                403,
            );
            return;
        }

        const gameSession = await prisma.gameSession.findUnique({
            where: { quizId: quiz.id },
            select: {
                id: true,
                status: true,
            },
        });

        if (!gameSession) {
            ResponseWriter.error(
                res,
                'QUIZ_SESSION_NOT_ACTIVE',
                'Quiz session is not available yet. Please try again later.',
                undefined,
                500,
            );
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            const spectator = await tx.spectator.create({
                data: {
                    quizId: quizId,
                    nickname: GenerateUser.getRandomName(),
                    avatar: GenerateUser.getRandomAvatar(),
                    ipAddress: req.ip || 'unknown',
                },
            });

            await tx.gameSession.update({
                where: {
                    id: gameSession.id,
                },
                data: {
                    totalSpectators: {
                        increment: 1,
                    },
                },
            });

            return { spectator };
        });

        try {
            redisCache.set_spectator(gameSession.id, result.spectator.id, result.spectator);
        } catch (redisErr) {
            console.error('Redis cache error:', redisErr);
        }

        const secureTokenData = QuizAction.generateUserToken(
            result.spectator.id,
            quiz.id,
            gameSession.id,
            USER_TYPE.SPECTATOR,
        );

        try {
            res.cookie(NOCTURN_COOKIE_NAME, secureTokenData, {
                httpOnly: true,
                secure: env.SERVER_NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });

            // two data args
            res.status(200).json({
                success: true,
                message: 'Successfully joined the quiz!',
                quizId: quiz.id,
                spectatorId: result.spectator.id,
            });
        } catch (cookieErr) {
            console.error('Cookie setting error:', cookieErr);

            await prisma
                .$transaction(async (tx) => {
                    await tx.spectator.delete({
                        where: { id: result.spectator.id },
                    });
                    await tx.gameSession.update({
                        where: { id: gameSession.id },
                        data: {
                            totalSpectators: {
                                decrement: 1,
                            },
                        },
                    });
                })
                .catch((cleanupErr) => {
                    console.error('Failed to cleanup after cookie error:', cleanupErr);
                });
            ResponseWriter.error(
                res,
                'FAILED_WHILE_SETTING_COOKIE',
                'Could not set authentication cookie. Please try again.',
                undefined,
                500,
            );
            return;
        }
    } catch (err) {
        console.error('Error while creating spectator', err);
        ResponseWriter.system_error(res);
        return;
    }
}
