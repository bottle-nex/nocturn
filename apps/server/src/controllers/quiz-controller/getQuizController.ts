import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';

enum QuizResponseType {
    QUIZ_FOUND = 'QUIZ_FOUND',
    QUIZ_NOT_EXIST = 'QUIZ_NOT_EXIST',
    ACCESS_DENIED = 'ACCESS_DENIED',
    INVALID_QUIZ_ID = 'INVALID_QUIZ_ID',
    INVALID_USER = 'INVALID_USER',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

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
        const quiz = await prisma.quiz.findFirst({
            where: {
                id: quizId,
            },
            include: {
                questions: true,
            },
        });

        if (!quiz) {
            res.status(201).json({
                success: true,
                message: 'Quiz not found',
                type: QuizResponseType.QUIZ_NOT_EXIST,
            });
            return;
        }

        if (quiz) {
            const existedQuiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId,
                    hostId: String(userId),
                },
            });
            if (!existedQuiz) {
                res.status(201).json({
                    success: true,
                    message: 'Access denied',
                    type: QuizResponseType.ACCESS_DENIED,
                });
                return;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Quiz retrieved successfully',
            type: QuizResponseType.QUIZ_FOUND,
            quiz,
        });
        return;
    } catch (error) {
        console.error('GET_QUIZ_ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            type: QuizResponseType.INTERNAL_ERROR,
        });
        return;
    }
}
