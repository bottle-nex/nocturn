import { Request, Response } from 'express';
import { spectatorJoinSchema } from '../../schemas/spectatorJoinSchema';
import prisma from '@repo/db/client';
import GenerateUser from '../../class/generateUser';
import QuizAction from '../../class/quizAction';
import { USER_TYPE } from '../../types/web-socket-types';
import { redisCacheInstance } from '../../services/init-services';
import { env } from '../../configs/env';

export default async function spectatorJoinController(req: Request, res: Response) {
    const parsedData = spectatorJoinSchema.safeParse(req.body);
    const redisCache = redisCacheInstance;

    if (!parsedData.success) {
        res.status(400).json({
            success: false,
            message: 'Invalid request data',
        });
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
            },
        });

        if (!quiz) {
            res.status(404).json({
                success: false,
                message: 'Invalid quiz code. Please check and try again.',
            });
            return;
        }

        if (!['LIVE'].includes(quiz.status)) {
            res.status(403).json({
                success: false,
                message: 'Quiz is not available for joining at this time.',
            });
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
            res.status(500).json({
                success: false,
                message: 'Quiz session is not available yet. Please try again later.',
            });
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            const spectator = await prisma.spectator.create({
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

        const secureTokenData = QuizAction.generateUserToken(
            result.spectator.id,
            quiz.id,
            gameSession.id,
            USER_TYPE.SPECTATOR,
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

            res.status(500).json({
                success: false,
                message: 'Could not set authentication cookie. Please try again.',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Successfully joined the quiz!',
            quizId: quiz.id,
        });
        return;
    } catch (error) {
        console.error('Error during spectator join:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while trying to join the quiz. Please try again.',
        });
        return;
    }
}
