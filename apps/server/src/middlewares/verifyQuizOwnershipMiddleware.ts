import { prisma } from '@nocturn/database';
import { NextFunction, Request, Response } from 'express';

export default async function verifyQuizOwnershipMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const quizId = req.params.quizId;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized user' });
        return;
    }

    if (!quizId) {
        res.status(400).json({ success: false, message: 'Quiz id is required' });
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                hostId: String(userId),
            },
        });

        if (!quiz) {
            res.status(403).json({ success: false, message: 'You are not authorized' });
            return;
        }

        next();
    } catch {
        res.status(500).json({ message: 'Error deleting quiz' });
        return;
    }
}
