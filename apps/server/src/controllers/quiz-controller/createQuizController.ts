import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { TemplateEnum } from '../../schemas/createQuizSchema';
import { getRandomSampleQuiz } from '../../data/sampleQuizData';

export default async function createQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const sample = getRandomSampleQuiz();
    const templates = Object.values(TemplateEnum);
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    console.log('randomTemplate', randomTemplate);

    try {
        const template = await prisma.template.findUnique({ where: { name: randomTemplate } });
        console.log('template found is : ', template);
        if (!template) {
            ResponseWriter.system_error(res);
            return;
        }

        const quiz = await prisma.quiz.create({
            data: {
                title: sample.title,
                templateId: template.id,
                prizePool: 0,
                currency: 'SOL',
                hostId: req.user.id,
                questions: {
                    create: [
                        {
                            question: sample.question,
                            options: sample.options,
                            correctAnswer: sample.correctAnswer,
                            difficulty: 1,
                            basePoints: 100,
                            timeLimit: 30,
                            readingTime: 4,
                            orderIndex: 0,
                            hintLaunched: false,
                        },
                    ],
                },
            },
            include: {
                template: true,
                questions: true,
            },
        });

        console.log('quiz created is : ', quiz);

        ResponseWriter.created(res, quiz);
        return;
    } catch (error) {
        console.error('Failed to create quiz:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
