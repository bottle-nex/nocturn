import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export default async function getSelectedQuestionDetails(req: Request, res: Response) {
    const { quizId, questionIndex } = req.params;

    if (!quizId || questionIndex === undefined || questionIndex === null) {
        ResponseWriter.invalid_data(res, 'Invalid request - quizId and questionIndex are required');
        return;
    }

    const targetOrderIndex = Number(questionIndex);

    if (isNaN(targetOrderIndex) || targetOrderIndex < 0) {
        ResponseWriter.custom(
            res,
            false,
            'INVALID_QUESTION_INDEX',
            'Invalid questionIndex - must be a non-negative number',
            400,
        );
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
            ResponseWriter.not_found(res, 'Quiz not found');
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
            ResponseWriter.custom(
                res,
                false,
                'NO_AVAILABLE_QUESTION',
                'No unasked questions available',
                404,
            );
            return;
        }

        const question = currentQuestion;
        ResponseWriter.success(res, question);
        return;
    } catch (error) {
        console.error('Unexpected error in getSelectedQuestionDetails: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
