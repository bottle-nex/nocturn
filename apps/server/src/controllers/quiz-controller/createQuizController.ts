import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { createQuizSchema, TemplateEnum } from '../../schemas/createQuizSchema';
import { prisma } from '@nocturn/database';

export default async function createQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { data, success } = createQuizSchema.safeParse(req.body);
    console.log('data from frontend is: ', data);

    if (!success) {
        console.log('failed to parse the data');
        ResponseWriter.invalid_data(res, 'Invalid quiz data');
        return;
    }

    const { id: _ignored, questions, ...quizData } = data;

    try {
        const db_template = await prisma.template.findUnique({
            where: { name: TemplateEnum.CLASSIC },
        });
        console.log('template in db is: ', db_template);

        if (!db_template || !db_template.theme) {
            ResponseWriter.not_found(res, 'Template not found');
            return;
        }

        const quiz = await prisma.quiz.create({
            data: {
                ...quizData,
                templateId: db_template.id,
                theme: db_template.theme,
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
        console.log('quiz created is: ', quiz);

        ResponseWriter.success(res, { id: quiz.id });
        return;
    } catch (error) {
        console.error('Failed to create quiz:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
