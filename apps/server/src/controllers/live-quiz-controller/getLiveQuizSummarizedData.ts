import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';

export async function getLiveQuizSummarizedData(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const { quizId } = req.params;
        if (!quizId) {
            ResponseWriter.invalid_data(res, 'quiz id not found', 400);
            return;
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                hostId: user.id.toString(),
            },
        });

        if (!quiz) {
            ResponseWriter.not_authorized(res, 'quiz not found');
            return;
        }

        const quizQuestions = await prisma.question.findMany({
            where: { quizId },
            select: {
                id: true,
                question: true,
                difficulty: true,
                basePoints: true,
                orderIndex: true,
                explanation: true,
                hint: true,
            },
            orderBy: {
                orderIndex: 'asc',
            },
        });

        const questions = quizQuestions.map((q) => ({
            id: q.id,
            title: q.question.substring(0, 10) + '...',
            difficulty: q.difficulty,
        }));

        ResponseWriter.success(res, questions);
        return;
    } catch (err) {
        console.error('Unexpected error in getQuestionSummaries: ', err);
        ResponseWriter.system_error(res);
        return;
    }
}
