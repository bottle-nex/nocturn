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
        });

        if (!parsed_data.success) {
            ResponseWriter.invalid_data(res, 'quiz id not found');
            return;
        }

        const { quizId: quiz_id, after: questionAfterIndex } = parsed_data.data;

        console.log("quizId: ", quiz_id);
        console.log("after: ", questionAfterIndex);

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

        const result = await prisma.$transaction(async (tx) => {
            // if questionAfterIndex is not provided then return a random question
            if (!questionAfterIndex) {
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
                console.log("question is found and after is not provided: ", question);
                return question;
            }

            if (quiz._count.questions < questionAfterIndex) return null;

            let question: Partial<QuestionType> | null;

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
            });

            question = raw_question
                ? {
                      ...raw_question,
                      hint: raw_question.hint ?? undefined,
                      imageUrl: raw_question.imageUrl ?? undefined,
                  }
                : null;

            if (!question) {
                const raw_question = await tx.question.findFirst({
                    where: {
                        quizId: quiz_id,
                        isAsked: false,
                        orderIndex: {
                            lt: questionAfterIndex,
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

                question = raw_question
                    ? {
                          ...raw_question,
                          hint: raw_question.hint ?? undefined,
                          imageUrl: raw_question.imageUrl ?? undefined,
                      }
                    : null;
            }

            return question;
        });

        const question = result;

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
