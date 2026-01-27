import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { v4 as uuid } from 'uuid';
import { prisma } from '@nocturn/database';

export default async function createQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { data, success } = createQuizSchema.safeParse(req.body);
    if (!success) {
        ResponseWriter.invalid_data(res, 'Invalid quiz data');
        return;
    }

    const { id: _ignored, questions, ...quizData } = data;

    try {
        const quiz_id = uuid();

        const quiz = await prisma.quiz.create({
            data: {
                id: quiz_id,
                ...quizData,
                host: {
                    connect: {
                        id: req.user.id,
                    },
                },
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
        });

        ResponseWriter.success(res, quiz, 'Quiz created successfully');
        return;
    } catch (error) {
        console.error('Failed to create quiz:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
