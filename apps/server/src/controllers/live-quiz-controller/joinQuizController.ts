import { Request, Response } from 'express';
import { prisma } from '@nocturn/database';
import GenerateUser from '../../class/generateUser';
import QuizAction from '../../class/quizAction';
import { LiveGameTokenPayload, NOCTURN_COOKIE_NAME, QuizStatusEnum, SessionStatusEnum, USER_TYPE } from '@nocturn/types';
import { redisCacheInstance } from '../../services/init.services';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';
import { quizJoinSchema } from '../../schemas/quizJoinSchema';
import jwt from 'jsonwebtoken';

export default class JoinQuizController {

    static async participant(req: Request, res: Response) {
        const parseResult = quizJoinSchema.safeParse(req.body);
        const redisCache = redisCacheInstance;

        if (!parseResult.success) {
            ResponseWriter.invalid_data(res);
            return;
        }

        const { code, email, name, force } = parseResult.data;

        try {
            const quiz = await prisma.quiz.findUnique({
                where: { participantCode: code },
                select: { id: true, status: true },
            });

            if (!quiz) {
                ResponseWriter.error(res, 'INVALID_QUIZ_CODE', 'Invalid quiz code. Please check and try again.', undefined, 404);
                return;
            }

            if (!['LIVE'].includes(quiz.status)) {
                ResponseWriter.error(res, 'QUIZ_NOT_LIVE', 'Quiz is not available for joining at this time.', undefined, 403);
                return;
            }

            const can_join_again = JoinQuizController.can_join_again(req, res, USER_TYPE.PARTICIPANT, quiz.id, force || false);
            if (!can_join_again) return;

            const gameSession = await prisma.gameSession.findUnique({
                where: { quizId: quiz.id },
                select: { id: true, status: true },
            });

            if (!gameSession) {
                ResponseWriter.error(res, 'QUIZ_SESSION_NOT_ACTIVE', 'Quiz session is not available yet. Please try again later.', undefined, 500);
                return;
            }

            if ([SessionStatusEnum.LIVE, SessionStatusEnum.COMPLETED].includes(gameSession.status as SessionStatusEnum)) {
                ResponseWriter.error(res, 'QUIZ_STARTED', 'Quiz is live. New participants cannot join.');
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

                redisCache.set_participant(gameSession.id, participant.id, participant);

                await tx.gameSession.update({
                    where: { id: gameSession.id },
                    data: {
                        totalParticipants: { increment: 1 },
                        activeParticipants: { increment: 1 },
                    },
                });

                return { participant };
            });

            const token = QuizAction.generateLiveGameToken(
                result.participant.id,
                quiz.id,
                gameSession.id,
                USER_TYPE.PARTICIPANT,
                result.participant.nickname,
            );

            try {
                await JoinQuizController.set_auth_cookie(res, token);
            } catch (cookieErr) {
                console.error('Cookie setting error:', cookieErr);
                await prisma.$transaction(async (tx) => {
                    await tx.participant.delete({ where: { id: result.participant.id } });
                    await tx.gameSession.update({
                        where: { id: gameSession.id },
                        data: {
                            totalParticipants: { decrement: 1 },
                            activeParticipants: { decrement: 1 },
                        },
                    });
                }).catch((cleanupErr) => console.error('Failed to cleanup after cookie error:', cleanupErr));

                ResponseWriter.error(res, 'FAILED_WHILE_SETTING_COOKIE', 'Could not set authentication cookie. Please try again.', undefined, 500);
                return;
            }

            ResponseWriter.success(res, quiz.id, 'Successfully joined the quiz!');
        } catch (err) {
            console.error('Error during participant join:', err);
            ResponseWriter.system_error(res);
        }
    }

    static async spectator(req: Request, res: Response) {
        const parsedData = quizJoinSchema.safeParse(req.body);
        const redisCache = redisCacheInstance;

        if (!parsedData.success) {
            ResponseWriter.invalid_data(res);
            return;
        }

        const { code, force = false } = parsedData.data;

        try {
            const quiz = await prisma.quiz.findUnique({
                where: { spectatorCode: code },
                select: { id: true, status: true, allowNewSpectator: true },
            });

            if (!quiz) {
                ResponseWriter.not_found(res, 'Invalid quiz code. Please check and try again.');
                return;
            }

            if (!quiz.allowNewSpectator) {
                ResponseWriter.custom(res, false, 'NOT_ALLOWED', 'No new spectators are allowed for this quiz.', 200);
                return;
            }

            if (!['LIVE'].includes(quiz.status)) {
                ResponseWriter.error(res, 'QUIZ_NOT_LIVE', 'Quiz is not available for joining at this time.', undefined, 403);
                return;
            }

            const can_join_again = JoinQuizController.can_join_again(req, res, USER_TYPE.SPECTATOR, quiz.id, force);
            if (!can_join_again) return;

            const gameSession = await prisma.gameSession.findUnique({
                where: { quizId: quiz.id },
                select: { id: true, status: true },
            });

            if (!gameSession) {
                ResponseWriter.error(res, 'QUIZ_SESSION_NOT_ACTIVE', 'Quiz session is not available yet. Please try again later.', undefined, 500);
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
                    where: { id: gameSession.id },
                    data: { totalSpectators: { increment: 1 } },
                });

                return { spectator };
            });

            const token = QuizAction.generateLiveGameToken(
                result.spectator.id,
                quiz.id,
                gameSession.id,
                USER_TYPE.SPECTATOR,
                result.spectator.nickname,
            );

            try {
                await JoinQuizController.set_auth_cookie(res, token);
            } catch (cookieErr) {
                console.error('Cookie setting error:', cookieErr);
                await prisma.$transaction(async (tx) => {
                    await tx.spectator.delete({ where: { id: result.spectator.id } });
                    await tx.gameSession.update({
                        where: { id: gameSession.id },
                        data: { totalSpectators: { decrement: 1 } },
                    });
                }).catch((cleanupErr) => console.error('Failed to cleanup after cookie error:', cleanupErr));

                ResponseWriter.error(res, 'FAILED_WHILE_SETTING_COOKIE', 'Could not set authentication cookie. Please try again.', undefined, 500);
                return;
            }

            ResponseWriter.success(res, quiz.id, 'Successfully joined the quiz!');
        } catch (error) {
            console.error('Error during spectator join:', error);
            ResponseWriter.system_error(res);
        }
    }

    static async host(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user?.id) {
                ResponseWriter.not_authorized(res);
                return;
            }

            const { quizId } = req.body;
            if (!quizId) {
                ResponseWriter.invalid_data(res, 'Quiz ID not provided');
                return;
            }

            const [quiz, gameSession] = await Promise.all([
                prisma.quiz.findUnique({ where: { id: quizId } }),
                prisma.gameSession.findUnique({ where: { quizId } }),
            ]);

            if (!quiz) {
                ResponseWriter.not_found(res, 'Quiz not found');
                return;
            }

            if (quiz.hostId !== user.id) {
                ResponseWriter.not_authorized(res, "You're not authorized to access this quiz");
                return;
            }

            if (!gameSession || quiz.status !== QuizStatusEnum.LIVE) {
                ResponseWriter.error(res, 'QUIZ_NOT_LIVE', 'Quiz is not live', undefined, 422);
                return;
            }

            const token = QuizAction.generateLiveGameToken(
                String(user.id),
                quizId,
                gameSession.id,
                USER_TYPE.HOST,
                req.user?.name,
            );

            await JoinQuizController.set_auth_cookie(res, token);
            ResponseWriter.success(res, { quiz, gameSession }, 'Quiz launched successfully', 200);
        } catch (error) {
            console.error('Error in host join controller:', error);
            ResponseWriter.system_error(res);
        }
    }

    private static async set_auth_cookie(res: Response, token: string): Promise<void> {
        res.cookie(NOCTURN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: env.SERVER_NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
    }

    private static can_join_again(
        req: Request,
        res: Response,
        current_user_type: USER_TYPE,
        quiz_id: string,
        force: boolean,
    ): boolean {

        const token = req.cookies?.[NOCTURN_COOKIE_NAME];
        if (!token) return true;

        const decoded = jwt.verify(token, env.SERVER_JWT_SECRET) as LiveGameTokenPayload;

        if (quiz_id !== decoded.quizId) return true;

        if (decoded.role === current_user_type) {
            ResponseWriter.custom(
                res,
                true,
                `ALREADY_A_MEMBER`,
                `You're already a ${decoded.role.toLowerCase()}`,
                200,
                {
                    message: `You're already a ${decoded.role.toLowerCase()} of this quiz`,
                    join_back: `${env.SERVER_WEB_URL}/new/${quiz_id}`,
                },
            );
            return false;
        } else {
            if (force) return true;
            ResponseWriter.custom(
                res,
                true,
                `ALREADY_A_MEMBER`,
                `You were a ${decoded.role?.toLowerCase()} before!`,
                200,
                {
                    message: `You were a ${decoded.role?.toLowerCase()} before!`,
                    join_back: `${env.SERVER_WEB_URL}/new/${quiz_id}`,
                    join_as: `${current_user_type.toLowerCase()}`,
                },
            );
            return false;
        }

    }
}