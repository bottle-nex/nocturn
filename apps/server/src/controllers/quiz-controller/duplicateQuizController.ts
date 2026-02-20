import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function duplicateQuizController(req: Request, res: Response) {
    const user = req.user;

    if (!user || !user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;
    if (!quizId) {
        ResponseWriter.not_found(res);
        return;
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                hostId: user.id,
                isDeleted: false,
            },
            include: {
                questions: true,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res);
            return;
        }

        const duplicateQuiz = await prisma.quiz.create({
            data: {
                title: quiz.title,
                description: quiz.description,
                template: {
                    connect: { id: quiz.templateId },
                },
                prizePool: quiz.prizePool,
                currency: quiz.currency,
                basePointsPerQuestion: quiz.basePointsPerQuestion,
                pointsMultiplier: quiz.pointsMultiplier,
                timeBonus: quiz.timeBonus,
                eliminationThreshold: quiz.eliminationThreshold,
                isFavourite: quiz.isFavourite,
                questionTimeLimit: quiz.questionTimeLimit,
                breakBetweenQuestions: quiz.breakBetweenQuestions,
                autoSave: quiz.autoSave,
                liveChat: quiz.liveChat,
                spectatorMode: quiz.spectatorMode,
                allowNewSpectator: quiz.allowNewSpectator,
                host: {
                    connect: { id: user.id },
                },
                questions: {
                    create: quiz.questions.map((q) => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        difficulty: q.difficulty,
                        basePoints: q.basePoints,
                        timeLimit: q.timeLimit,
                        readingTime: q.readingTime,
                        orderIndex: q.orderIndex,
                        explanation: q.explanation,
                        hint: q.hint,
                        imageUrl: q.imageUrl,
                        isAsked: false,
                    })),
                },
            },
            include: {
                host: true,
                questions: {
                    take: 1,
                },
            },
        });

        ResponseWriter.success(res, duplicateQuiz, 'Quiz duplicated successfully');
        return;
    } catch (err) {
        console.error('Error in duplicating quiz: ', err);
        ResponseWriter.system_error(res);
        return;
    }
}
