import { Request, Response } from 'express';
import { prisma } from '@nocturn/database';
import GenerateUser from '../../class/generateUser';
import QuizAction from '../../class/quizAction';
import { LiveGameTokenPayload, NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import { redisCacheInstance } from '../../services/init.services';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';
import { quizJoinSchema } from '../../schemas/quizJoinSchema';
import jwt from "jsonwebtoken";

export default async function spectatorJoinController(req: Request, res: Response) {
    const parsedData = quizJoinSchema.safeParse(req.body);
    const redisCache = redisCacheInstance;

    if (!parsedData.success) {
        ResponseWriter.invalid_data(res);
        return;
    }

    const code = parsedData.data.code;
    const force = parsedData.data.force ?? false;

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

        const joining_token = req.cookies?.[NOCTURN_COOKIE_NAME];
        if (joining_token) {
            const decoded = jwt.verify(joining_token, env.SERVER_JWT_SECRET) as LiveGameTokenPayload;
            if (decoded.quizId === quiz.id) {
                switch (decoded.role) {
                    case USER_TYPE.PARTICIPANT: {
                        if (force) break;

                        ResponseWriter.custom(
                            res,
                            true,
                            'ALREADY_A_PARTICIPANT',
                            "You're already a participant",
                            200,
                            {
                                message: "You're already a participant of this quiz",
                                link: `${env.SERVER_WEB_URL}/new/${quiz.id}`,
                            },
                        );
                        return;
                    };
                    case USER_TYPE.SPECTATOR: {
                        ResponseWriter.custom(
                            res,
                            true,
                            'ALREADY_A_SPECTATOR',
                            "You're already a spectator",
                            200,
                            {
                                message: "You're already a spectator of this quiz",
                                link: `${env.SERVER_WEB_URL}/new/${quiz.id}`,
                            },
                        );
                        return;
                    };

                }
            }
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
