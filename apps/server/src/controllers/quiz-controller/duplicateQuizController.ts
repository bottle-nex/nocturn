import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma, TemplateEnum } from '@nocturn/database';

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
                template: true,
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res);
            return;
        }

        const duplicateQuiz = await prisma.quiz.create({
            data: {
                title: `${quiz.title}`,
                description: quiz.description,
                templateId: TemplateEnum.CLASSIC,
                prizePool: 0,
                currency: 'SOL',
                isFavourite: false,
                allowNewSpectator: true,
                hostId: req.user.id,
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
                template: true,
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
