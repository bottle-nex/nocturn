import { Request, Response } from 'express';
import { prisma } from '@nocturn/database';
import GenerateUser from '../../class/generateUser';
import QuizAction from '../../class/quizAction';
import { NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import { redisCacheInstance } from '../../services/init.services';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';
import { quizJoinSchema } from '../../schemas/quizJoinSchema';

export default async function spectatorJoinController(req: Request, res: Response) {
    const parsedData = quizJoinSchema.safeParse(req.body);
    const redisCache = redisCacheInstance;

    if (!parsedData.success) {
        ResponseWriter.invalid_data(res);
        return;
    }

    const code = parsedData.data.code;

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                spectatorCode: code,
            },
            select: {
                id: true,
                status: true,
                allowNewSpectator: true,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'Invalid quiz code. Please check and try again.');
            return;
        }

        if (!quiz.allowNewSpectator) {
            ResponseWriter.custom(
                res,
                false,
                'NOT_ALLOWED',
                'No new spectaors are allowed for this quiz.',
                200,
            );
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
                    quizId: quiz.id,
                    nickname: GenerateUser.getRandomName(),
                    avatar: GenerateUser.getRandomAvatar(),
                    ipAddress: req.ip || 'unknown',
                },
            });

            redisCache.set_spectator(gameSession.id, spectator.id, spectator);

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

        const secureTokenData = QuizAction.generateLiveGameToken(
            result.spectator.id,
            quiz.id,
            gameSession.id,
            USER_TYPE.SPECTATOR,
            result.spectator.nickname,
        );

        try {
            res.cookie(NOCTURN_COOKIE_NAME, secureTokenData, {
                httpOnly: true,
                secure: env.SERVER_NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
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

        const quizId = quiz.id;
        ResponseWriter.success(res, quizId, 'Successfully joined the quiz!');
        return;
    } catch (error) {
        console.error('Error during spectator join:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
