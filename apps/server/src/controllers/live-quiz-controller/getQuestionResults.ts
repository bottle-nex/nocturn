import { Request, Response } from 'express';
import { ParticipantScreen, prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';

export default async function getQuestionResults(req: Request, res: Response) {
    try {
        const { quizId, questionId } = req.body;

        if (!quizId || !questionId) {
            ResponseWriter.invalid_data(
                res,
                'Incomplete request data',
            );
            return;
        }

        const data = await prisma.$transaction(async (tx) => {
            const startTime = await tx.gameSession.findUnique({
                where: {
                    quizId: quizId,
                },
                select: {
                    phaseStartTime: true,
                },
            });

            const question = await tx.question.findUnique({
                where: {
                    id: questionId,
                },
                select: {
                    correctAnswer: true,
                    explanation: true,
                },
            });

            const responses = await tx.response.findMany({
                where: {
                    questionId: questionId,
                },
                select: {
                    id: true,
                    participant: true,
                    isCorrect: true,
                    selectedAnswer: true,
                    pointsEarned: true,
                },
            });

            const scores = await tx.participant.findMany({
                where: {
                    quizId: quizId,
                },
                select: {
                    id: true,
                    totalScore: true,
                    finalRank: true,
                    longestStreak: true,
                },
            });

            return {
                scores: scores,
                responses: responses,
                correctAnswer: question?.correctAnswer,
                explanation: question?.explanation,
                screen: ParticipantScreen.QUESTION_RESULTS,
                startTime: startTime,
            };
        });

        ResponseWriter.success(
            res,
            data,
            'Fetched question results successfully',
            200,
        );
        return;
    } catch (error) {
        console.error('Failed to fetch question results: ', error);
        res.status(500).json({
            success: false,
            message: 'failed to fetch question results',
            value: 'INTERNAL_SERVER_ERROR',
        });
        ResponseWriter.system_error(res);
        return;
    }
}
