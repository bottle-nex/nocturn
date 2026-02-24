import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { ApiResponse, QuestionType } from '@nocturn/types';
import { getUnAskedQuestionSchema } from '../../schemas/getUnAskedQuestionSchema';

export default async function getUnAskedQuestionController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const parsed_data = getUnAskedQuestionSchema.safeParse({
            quizId: req.params.quizId,
            after: req.query.after,
            before: req.query.before,
        });

        if (!parsed_data.success) {
            console.log({ parsed_data });
            ResponseWriter.invalid_data(res, 'quiz id not found');
            return;
        }

        const {
            quizId: quiz_id,
            after: questionAfterIndex,
            before: questionBeforeIndex,
        } = parsed_data.data;

        console.log({ quiz_id });

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quiz_id,
                hostId: user.id,
            },
            select: {
                id: true,
                _count: {
                    select: {
                        questions: true,
                    },
                },
            },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'quiz not found');
            return;
        }

        const question = await prisma.$transaction(async (tx) => {
            if (questionAfterIndex || questionAfterIndex === 0) {
                if (quiz._count.questions < questionAfterIndex) return null;
                console.log('after: ', questionAfterIndex);
                const raw_question = await tx.question.findFirst({
                    where: {
                        quizId: quiz_id,
                        isAsked: false,
                        orderIndex: {
                            gt: questionAfterIndex,
                        },
                    },
                    select: {
                        id: true,
                        question: true,
                        options: true,
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
                });

                const question: Partial<QuestionType> | null = raw_question
                    ? {
                          ...raw_question,
                          hint: raw_question.hint ?? undefined,
                          imageUrl: raw_question.imageUrl ?? undefined,
                      }
                    : null;

                return question;
            }

            if (questionBeforeIndex) {
                if (questionBeforeIndex <= 0) return null;
                console.log('before: ', questionBeforeIndex);
                const raw_question = await tx.question.findFirst({
                    where: {
                        quizId: quiz_id,
                        isAsked: false,
                        orderIndex: {
                            lt: questionBeforeIndex,
                        },
                    },
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        hint: true,
                        difficulty: true,
                        basePoints: true,
                        timeLimit: true,
                        orderIndex: true,
                        imageUrl: true,
                        isAsked: true,
                    },
                    orderBy: {
                        orderIndex: 'desc',
                    },
                });
                console.log('found quesion index: ', raw_question);

                const question: Partial<QuestionType> | null = raw_question
                    ? {
                          ...raw_question,
                          hint: raw_question.hint ?? undefined,
                          imageUrl: raw_question.imageUrl ?? undefined,
                      }
                    : null;

                return question;
            }

            // if no index is provided then find a random one and return
            const question = await tx.question.findFirst({
                where: {
                    quizId: quiz_id,
                    isAsked: false,
                },
                select: {
                    id: true,
                    question: true,
                    options: true,
                    hint: true,
                    difficulty: true,
                    basePoints: true,
                    timeLimit: true,
                    orderIndex: true,
                    imageUrl: true,
                    isAsked: true,
                },
            });
            console.log('question is found and after is not provided: ', question);
            return question;
        });

        // no question found, means quiz ended
        if (!question) {
            ResponseWriter.secure_success(
                res,
                {
                    type: ApiResponse.GET_UN_ASKED_QUESTION,
                    data: {
                        end: true,
                        question: null,
                    },
                },
                'no more questions left',
            );
            return;
        }

        ResponseWriter.secure_success(
            res,
            {
                type: ApiResponse.GET_UN_ASKED_QUESTION,
                data: {
                    end: false,
                    question: {
                        ...question,
                        hint: question.hint ?? undefined,
                        imageUrl: question.imageUrl ?? undefined,
                    },
                },
            },
            'question fetched successfully',
        );
    } catch (error) {
        console.error('error in un asked question controller:', error);
        ResponseWriter.system_error(res);
    }
}
