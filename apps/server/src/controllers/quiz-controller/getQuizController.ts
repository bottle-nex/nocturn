import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import ResponseWriter from '../../class/response_writer';
import { CollabRole, NOCTURN_COOKIE_NAME, QuizResponseType } from '@nocturn/types';
import { env } from '../../configs/env';

export default async function getQuizController(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const quizId = req.params.quizId;
    if (!quizId) {
        res.status(400).json({
            success: false,
            message: 'Quiz ID is required',
            type: QuizResponseType.INVALID_QUIZ_ID,
        });
        return;
    }

    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'User authentication required',
            type: QuizResponseType.INVALID_USER,
        });
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                questions: true,
                CollabSession: {
                    include: {
                        collaborators: {
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
            ResponseWriter.custom(res, true, '', 'Quiz does not exist', 203, {
                type: QuizResponseType.QUIZ_NOT_EXIST,
            });
            return;
        }

        const is_owner = quiz.hostId === userId;
        const hasCollabSession = !!quiz.CollabSession;

        const collaborator = hasCollabSession
            ? quiz.CollabSession?.collaborators.find((collab) => collab.user.id === userId)
            : null;

        const is_collaborator = !!collaborator;

        if (!is_owner && !is_collaborator) {
            ResponseWriter.not_authorized(res, 'Access to this quiz is denied');
            return;
        }

        await QuizAction.record_quiz_view(quizId, String(userId));

        const userCollabRole: CollabRole = is_owner
            ? CollabRole.HOST
            : (collaborator?.role as CollabRole);

        const collabSessionId =
            hasCollabSession && quiz.CollabSession ? quiz.CollabSession.id : undefined;

        const secureTokenData = QuizAction.generateUserToken(
            userId,
            quiz.id,
            '',
            undefined,
            req.user.name,
            userCollabRole,
            collabSessionId,
        );

        res.cookie(NOCTURN_COOKIE_NAME, secureTokenData, {
            httpOnly: true,
            secure: env.SERVER_NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        console.log('cookie returning is : ', secureTokenData);

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
