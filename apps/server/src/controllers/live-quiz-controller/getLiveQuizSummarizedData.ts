import prisma from '@repo/db/client';
import { Request, Response } from 'express';

export async function getLiveQuizSummarizedData(req: Request, res: Response) {
    const { quizId } = req.params;

    try {
        const questions = await prisma.question.findMany({
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

        const summarizedQuestionData = questions.map((q) => ({
            id: q.id,
            title: q.question.substring(0, 10) + '...',
            difficulty: q.difficulty,
        }));

        res.status(201).json({ success: true, questions: summarizedQuestionData });
        return;
    } catch (err) {
        console.error('Unexpected error in getQuestionSummaries: ', err);
        res.status(500).json({ success: false, message: 'Failed to fetch summarized data' });
        return;
    }
}
