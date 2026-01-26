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

    const parsed = createQuizSchema.safeParse(req.body);
    if (!parsed.success) {
        ResponseWriter.invalid_data(res, 'Invalid quiz data');
        return;
    }

    const { folderId, questions, ...quizData } = parsed.data;

    try {
        const quiz_id = uuid();

        let folderConnect: { connect: { id: string } } | undefined;

        if (folderId) {
            const folder = await prisma.quizFolder.findUnique({
                where: { id: folderId },
                select: { userId: true },
            });

            if (!folder || folder.userId !== req.user.id) {
                ResponseWriter.invalid_data(res, 'Invalid folder');
                return;
            }

            folderConnect = { connect: { id: folderId } };
        }

        const quiz = await prisma.quiz.create({
            data: {
                id: quiz_id,
                ...quizData,
                ...(folderConnect && { folder: folderConnect }),

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
