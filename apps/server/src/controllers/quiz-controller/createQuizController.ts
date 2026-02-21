import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { TemplateEnum } from '../../schemas/createQuizSchema';
import { getRandomSampleQuiz } from '../../data/sampleQuizData';

export default async function createQuizController(req: Request, res: Response) {
    const now = Date.now();
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const sample = getRandomSampleQuiz();
    const templates = Object.values(TemplateEnum);
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    try {
        const quiz = await prisma.quiz.create({
            data: {
                title: sample.title,
                templateId: randomTemplate,
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
        console.log('quiz creation time taken is : ', Date.now() - now);

        ResponseWriter.created(res, quiz);
        return;
    } catch (error) {
        console.error('Failed to create quiz:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
