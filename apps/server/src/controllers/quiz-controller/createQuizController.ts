import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { prisma } from '@nocturn/database';
import { TemplateEnum } from '@nocturn/types';

export default async function createQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { data, success } = createQuizSchema.safeParse(req.body);

    if (!success) {
        console.log('failed to parse the data');
        ResponseWriter.invalid_data(res, 'Invalid quiz data');
        return;
    }

    const { questions, ...quizData } = data;

    try {
        const db_template = await prisma.template.findUnique({
            where: { name: TemplateEnum.CLASSIC },
        });

        if (!db_template) {
            ResponseWriter.not_found(res, 'Template not found');
            return;
        }

        const quiz = await prisma.quiz.create({
            data: {
                ...quizData,
                templateId: db_template.id,
                hostId: req.user.id,
                questions: {
                    create: questions.map((q) => ({
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
                    })),
                },
            },
            include: {
                template: true,
            },
        });

        ResponseWriter.success(res, { id: quiz.id });
        return;
    } catch (error) {
        console.error('Failed to create quiz:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
