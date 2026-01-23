import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import ResponseWriter from '../../class/response_writer';
import { QuizResponseType } from '@nocturn/types';

// check these, as these contain type
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
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                        id: true,
                                        image: true,
                                    },
                                },
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
        const is_collaborator = quiz.CollabSession?.collaborators.some(
            (collab) => collab.userId === userId,
        );

        if (!is_owner && !is_collaborator) {
            ResponseWriter.not_authorized(res, 'Access to this quiz is denied');
            return;
        }

        await QuizAction.record_quiz_view(quizId, String(userId));
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
