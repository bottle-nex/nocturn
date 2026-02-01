import { prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';
import { Request, Response } from 'express';

export default async function getQuestionsController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const { quizId } = req.params;
        if (!quizId) {
            ResponseWriter.invalid_data(res, 'quiz id not found');
            return;
        }

        // find the quiz
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                OR: [
                    { hostId: user.id },
                    {
                        CollabSession: {
                            collaborators: {
                                some: {
                                    id: user.id,
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                title: true,
                theme: true,
                questions: {
                    select: {
                        question: true,
                        options: true,
                        orderIndex: true,
                    },
                },
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'quiz not found');
            return;
        }

        ResponseWriter.success(
            res,
            {
                id: quiz.id,
                title: quiz.title,
                questions: quiz.questions,
                theme: quiz.theme,
            },
            'successfull fetched quiz questions',
        );

        return;
    } catch (error) {
        console.error('error in get questions controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
