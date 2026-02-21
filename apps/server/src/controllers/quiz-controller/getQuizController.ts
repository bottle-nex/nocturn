import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import ResponseWriter from '../../class/response_writer';
import { CollabRole, NOCTURN_COOKIE_NAME, QuizResponseType } from '@nocturn/types';
import { env } from '../../configs/env';

export default async function getQuizController(req: Request, res: Response): Promise<void> {

    const user = req.user;
    if (!user || !user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const quizId = req.params.quizId;
    if (!quizId) {
        ResponseWriter.invalid_data(res, 'quiz id is required');
        return;
    }

    try {
        const quiz = await prisma.quiz.findFirst({
            where: {
                id: quizId,
                OR: [
                    { hostId: user.id },
                    {
                        CollabSession: {
                            collaborators: {
                                some: {
                                    id: user.id,
                                    isBlocked: false,
                                },
                            }
                        }
                    }
                ]
            },
            include: {
                template: true,
                questions: true,
                CollabSession: {
                    include: {
                        collaborators: {
                            where: { isBlocked: false },
                            select: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                        id: true,
                                        image: true,
                                    },
                                },
                                role: true,
                            },
                        },
                    },
                },
            },
        });

        if (!quiz) {
            ResponseWriter.custom(res, true, '', 'Quiz does not exist', 404, {
                type: QuizResponseType.QUIZ_NOT_EXIST,
            });
            return;
        }

        const is_owner = quiz.hostId === user.id;
        const hasCollabSession = !!quiz.CollabSession;

        const collaborator = hasCollabSession
            ? quiz.CollabSession?.collaborators.find((collab) => collab.user.id === user.id)
            : null;

        QuizAction.record_quiz_view(quizId, String(user.id));

        const userCollabRole: CollabRole = is_owner
            ? CollabRole.HOST
            : (collaborator?.role as CollabRole);

        const collabSessionId = quiz.CollabSession?.id;

        if (collabSessionId) {
            const secureTokenData = QuizAction.generateCollabSessionToken(
                user.id,
                quiz.id,
                userCollabRole,
                req?.user.name,
                '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                collabSessionId,
            );

            res.cookie(NOCTURN_COOKIE_NAME, secureTokenData, {
                httpOnly: true,
                secure: env.SERVER_NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });
        } else {
            res.clearCookie(NOCTURN_COOKIE_NAME);
        }

        ResponseWriter.success(
            res,
            {
                type: QuizResponseType.QUIZ_FOUND,
                quiz: quiz,
            },
            'Quiz retrieved successfully',
        );
        return;
    } catch (error) {
        console.error('GET_QUIZ_ERROR:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
