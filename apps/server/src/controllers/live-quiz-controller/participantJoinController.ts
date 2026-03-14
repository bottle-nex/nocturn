import { Request, Response } from 'express';
import { prisma } from '@nocturn/database';
import GenerateUser from '../../class/generateUser';
import QuizAction from '../../class/quizAction';
import { LiveGameTokenPayload, NOCTURN_COOKIE_NAME, SessionStatusEnum, USER_TYPE } from '@nocturn/types';
import { redisCacheInstance } from '../../services/init.services';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';
import { quizJoinSchema } from '../../schemas/quizJoinSchema';
import jwt from "jsonwebtoken";

export default async function participantJoinController(req: Request, res: Response) {
    const parseResult = quizJoinSchema.safeParse(req.body);
    const redis_cache = redisCacheInstance;
    if (!parseResult.success) {
        ResponseWriter.invalid_data(res);
        return;
    }

    const { code, email, name, force } = parseResult.data;

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { participantCode: code },
            select: {
                id: true,
                status: true,
            },
        });

        if (!quiz) {
            ResponseWriter.error(
                res,
                'INVALID_QUIZ_CODE',
                'Invalid quiz code. Please check and try again.',
                undefined,
                404,
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
                                title: 'Rejoin detected',
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

        if (
            [SessionStatusEnum.LIVE, SessionStatusEnum.COMPLETED].includes(
                gameSession.status as SessionStatusEnum,
            )
        ) {
            ResponseWriter.error(
                res,
                'QUIZ_STARTED',
                'Quiz is live. New participants cannot join.',
            );
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            const participant = await tx.participant.create({
                data: {
                    quizId: quiz.id,
                    nickname: name ?? GenerateUser.getRandomName(),
                    avatar: GenerateUser.getRandomAvatar(),
                    ipAddress: req.ip || 'unknown',
                    email: email as string,
                },
            });

            redis_cache.set_participant(gameSession.id, participant.id, participant);

            await tx.gameSession.update({
                where: { id: gameSession.id },
                data: {
                    totalParticipants: {
                        increment: 1,
                    },
                    activeParticipants: {
                        increment: 1,
                    },
                },
            });

            return { participant };
        });

        const secureTokenData = QuizAction.generateLiveGameToken(
            result.participant.id,
            quiz.id,
            gameSession.id,
            USER_TYPE.PARTICIPANT,
            result.participant.nickname,
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
                    await tx.participant.delete({
                        where: { id: result.participant.id },
                    });
                    await tx.gameSession.update({
                        where: { id: gameSession.id },
                        data: {
                            totalParticipants: { decrement: 1 },
                            activeParticipants: { decrement: 1 },
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
    } catch (err) {
        console.error('Error during participant join:', err);
        ResponseWriter.system_error(res);
        return;
    }
}
