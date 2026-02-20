import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { prisma } from '@nocturn/database';
import { TemplateEnum } from '@nocturn/types';

export default async function createQuizController(req: Request, res: Response) {
    const now = Date.now();
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { data, success } = createQuizSchema.safeParse(req.body ?? {});
    console.log('parsing time taken is : ', now - Date.now());

    if (!success) {
        console.log('failed to parse the data');
        ResponseWriter.invalid_data(res, 'Invalid quiz data');
        return;
    }

    const { questions, id: _id, templateId: _templateId, ...quizData } = data;

    try {
        console.log('db query time taken is : ', Date.now() - now);
        const randomNumber = Math.floor(Math.random() * Object.values(TemplateEnum).length);
        const quiz = await prisma.quiz.create({
            data: {
                ...quizData,
                templateId: Object.values(TemplateEnum)[randomNumber],
                hostId: req.user.id,
                ...(questions.length > 0 && {
                    questions: {
                        create: questions.map((question) => question),
                    },
                }),
            },
            include: {
                template: true,
                questions: true,
            },
        });
        console.log('quiz creation time taken is : ', Date.now() - now);

        ResponseWriter.created(res, quiz);
        return;
    } catch (error) {
        console.error('Failed to create quiz:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
