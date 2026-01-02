import { Request, Response } from 'express';
import { prisma } from '@nocturn/database';
import GenerateUser from '../../class/generateUser';
import QuizAction from '../../class/quizAction';
import { participantJoinSchema } from '../../schemas/participantJoinSchema';
import { USER_TYPE } from '@nocturn/types';
import { redisCacheInstance } from '../../services/init-services';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';

export default async function participantJoinController(req: Request, res: Response) {
    const parseResult = participantJoinSchema.safeParse(req.body);
    const redis_cache = redisCacheInstance;
    if (!parseResult.success) {
        ResponseWriter.invalid_data(res);
        return;
    }

    const { code } = parseResult.data;

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

        if (!['WAITING', 'STARTING'].includes(gameSession.status)) {
            ResponseWriter.error(
                res,
                'QUIZ_STARTED',
                'Quiz has already started. New participants cannot join.',
                undefined,
                403,
            );
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            const participant = await tx.participant.create({
                data: {
                    quizId: quiz.id,
                    nickname: GenerateUser.getRandomName(),
                    avatar: GenerateUser.getRandomAvatar(),
                    ipAddress: req.ip || 'unknown',
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

        const secureTokenData = QuizAction.generateUserToken(
            result.participant.id,
            quiz.id,
            gameSession.id,
            USER_TYPE.PARTICIPANT,
        );

        try {
            res.cookie('token', secureTokenData, {
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
