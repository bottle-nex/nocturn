import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';

export default async function deleteQuizController(req: Request, res: Response) {
    const quizId = req.params.quizId;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized user',
        });
        return;
    }
    if (!quizId) {
        res.status(400).json({
            success: false,
            message: 'Quiz id is required',
        });
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
            },
            select: {
                status: true,
                title: true,
                description: true,
            },
        });

        if (!quiz) {
            res.status(404).json({
                success: false,
                message: "Quiz doesn't exist or already deleted",
            });
            return;
        }

        if (quiz?.status === 'LIVE') {
            res.status(409).json({
                success: false,
                message: "Quiz is live can't delete",
            });
            return;
        }

        QuizAction.deleteQuiz(quizId);
        res.status(200).json({
            success: true,
            message: 'Quiz deleted Successfully',
        });
        return;
    } catch {
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
        });
        return;
    }
}
