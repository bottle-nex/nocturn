import prisma from '@repo/db/client';
import { Request, Response } from 'express';

export default async function getSelectedQuestionDetails(req: Request, res: Response) {
    const { quizId, questionIndex } = req.params;

    if (!quizId || questionIndex === undefined || questionIndex === null) {
        res.status(400).json({
            success: false,
            message: 'Invalid request - quizId and questionIndex are required',
            value: 'INVALID_REQUEST',
        });
        return;
    }

    const targetOrderIndex = Number(questionIndex);

    if (isNaN(targetOrderIndex) || targetOrderIndex < 0) {
        res.status(400).json({
            success: false,
            message: 'Invalid questionIndex - must be a non-negative number',
            value: 'INVALID_QUESTION_INDEX',
        });
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
            },
            select: {
                questions: {
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        explanation: true,
                        hint: true,
                        difficulty: true,
                        basePoints: true,
                        timeLimit: true,
                        orderIndex: true,
                        imageUrl: true,
                        isAsked: true,
                    },
                    orderBy: {
                        orderIndex: 'asc',
                    },
                },
            },
        });

        if (!quiz) {
            res.status(404).json({
                success: false,
                message: 'Quiz not found',
                value: 'QUIZ_NOT_FOUND',
            });
            return;
        }

        let currentIndex = targetOrderIndex % quiz.questions.length;
        let attempts = 0;
        const maxAttempts = quiz.questions.length;

        let currentQuestion = quiz.questions.find((q) => q.orderIndex === currentIndex);

        while (currentQuestion && currentQuestion.isAsked && attempts < maxAttempts) {
            currentIndex = (currentIndex + 1) % quiz.questions.length;
            currentQuestion = quiz.questions.find((q) => q.orderIndex === currentIndex);
            attempts++;
        }

        if (!currentQuestion || currentQuestion.isAsked) {
            res.status(404).json({
                success: false,
                message: 'No unasked questions available',
                value: 'NO_AVAILABLE_QUESTION',
            });
            return;
        }

        res.status(200).json({
            success: true,
            question: currentQuestion,
        });
        return;
    } catch (error) {
        console.error('Unexpected error in getSelectedQuestionDetails: ', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch question data',
            value: 'INTERNAL_SERVER_ERROR',
        });
        return;
    }
}
