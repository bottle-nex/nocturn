import prisma from '@repo/db/client';
import { Request, Response } from 'express';
import GenerateUser from '../../class/generateUser';
import { redisCacheInstance } from '../../services/init-services';
import QuizAction from '../../class/quizAction';
import { USER_TYPE } from '../../types/web-socket-types';
import { env } from '../../configs/env';

export default async function spectatorJoinQuizViaURLController(req: Request, res: Response) {
    const redisCache = redisCacheInstance;
    const quizId = req.query.quizId as string;
    const spectatorToken = req.query.spectator_token as string;

    if (!quizId) {
        res.status(400).json({
            success: false,
            message: 'Invalid request data',
        });
        return;
    }

    if (!spectatorToken) {
        res.status(400).json({
            success: false,
            message: 'Invalid request data',
        });
        return;
    }

    try {
        const verify_token = QuizAction.verifyCookie(spectatorToken);

        if (!verify_token) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
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
            res.cookie('token', secureTokenData, {
                httpOnly: true,
                secure: env.SERVER_NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });

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
            res.status(500).json({
                success: false,
                message: 'Could not set authentication cookie. Please try again.',
            });
            return;
        }
    } catch (err) {
        console.error('Error while creating spectator', err);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while trying to join the quiz. Please try again.',
        });
        return;
    }
}
