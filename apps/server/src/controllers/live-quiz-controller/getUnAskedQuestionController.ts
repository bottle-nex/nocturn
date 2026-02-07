import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getUnAskedQuestionController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const { quiz_id } = req.body;

        if (!quiz_id) {
            ResponseWriter.invalid_data(res, 'quiz id is required');
            return;
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quiz_id,
                hostId: user.id,
            },
            select: {
                questions: {
                    where: {
                        isAsked: false,
                    },
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        explanation: true,
                        hint: true,
                        difficulty: true,
                        basePoints: true,
                        timeLimit: true,
                        orderIndex: true,
                        imageUrl: true,
                        isAsked: true,
                    },
                    orderBy: {
                        orderIndex: 'asc',
                    },
                    take: 1,
                },
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'quiz not found');
            return;
        }

        // means no question is left for asking, leading quiz end
        if (quiz.questions.length === 0) {
            ResponseWriter.success(
                res,
                {
                    end: true,
                    question: null,
                },
                'no more questions left',
            );
            return;
        }

        // if this part appears means questions are still left
        ResponseWriter.success(
            res,
            {
                end: false,
                question: quiz.questions[0],
            },
            'found un-asked question',
        );
        return;
    } catch (error) {
        console.error('error in un asked question controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
