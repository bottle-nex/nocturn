import prisma, { GameSession, Quiz, QuizStatus } from '@repo/db/client';
import QuizAction from '../../class/quizAction';
import { CreateQuizType, QuestionType } from '../../schemas/createQuizSchema';

export enum QUIZ_STATUS {
    SAVE_NEW_QUIZ = 'SAVE_NEW_QUIZ',
    UPDATE_QUIZ = 'UPDATE_QUIZ',
    PUBLISH_QUIZ = 'PUBLISH_QUIZ',
    LAUNCH_QUIZ = 'LAUNCH_QUIZ',
}

type quiz_controller =
    | {
          type: QUIZ_STATUS.SAVE_NEW_QUIZ;
          success: boolean;
          quiz?: Partial<Quiz>;
          error?: unknown;
          isHost?: boolean;
      }
    | { type: QUIZ_STATUS.UPDATE_QUIZ; success: boolean; quiz?: Partial<Quiz>; error?: unknown }
    | {
          type: QUIZ_STATUS.PUBLISH_QUIZ;
          success: boolean;
          quiz?: Partial<Quiz>;
          status?: QuizStatus;
          error?: unknown;
          isHost?: boolean;
      }
    | {
          type: QUIZ_STATUS.LAUNCH_QUIZ;
          success: boolean;
          quiz?: Partial<Quiz>;
          gameSession?: Partial<GameSession>;
          status?: QuizStatus;
          error?: unknown;
          isHost?: boolean;
      };

export default class QuizController {
    public async update_quiz_status(
        status: QUIZ_STATUS,
        quizId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
        hostId: number,
    ): Promise<quiz_controller | null> {
        switch (status) {
            case QUIZ_STATUS.SAVE_NEW_QUIZ:
                return await this.handle_save_new_quiz(quizId, quiz_data, questions, hostId);

            case QUIZ_STATUS.UPDATE_QUIZ:
                return await this.handle_update_quiz(quizId, quiz_data, questions);

            case QUIZ_STATUS.PUBLISH_QUIZ:
                return await this.handle_publish_quiz(quizId, quiz_data, questions, hostId);

            case QUIZ_STATUS.LAUNCH_QUIZ:
                return await this.handle_launch_quiz(quizId, quiz_data, questions, hostId);

            default:
                return null;
        }
    }

    private async handle_save_new_quiz(
        quizId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
        hostId: number,
    ): Promise<quiz_controller> {
        try {
            let quiz = await this.find_quiz(quizId);
            if (!quiz) {
                quiz = await prisma.quiz.create({
                    data: {
                        ...quiz_data,
                        scheduledAt: quiz_data.scheduledAt
                            ? new Date(quiz_data.scheduledAt)
                            : undefined,
                        hostId: String(hostId),
                        questions: {
                            create: questions,
                        },
                    },
                });

                const response: quiz_controller = {
                    type: QUIZ_STATUS.SAVE_NEW_QUIZ,
                    success: true,
                    quiz: quiz,
                };

                return response;
            } else {
                const isValidOwner = await QuizAction.validOwner(hostId, quizId);
                if (!isValidOwner) {
                    return {
                        type: QUIZ_STATUS.SAVE_NEW_QUIZ,
                        success: false,
                        isHost: false,
                    };
                }

                return await this.handle_update_quiz(quizId, quiz_data, questions);
            }
        } catch (error) {
            return this.handle_error(QUIZ_STATUS.SAVE_NEW_QUIZ, error);
        }
    }

    private async handle_update_quiz(
        quizId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ): Promise<quiz_controller> {
        try {
            // check for the valid owner, before calling this function
            const quiz = await prisma.$transaction(async (tx) => {
                await tx.question.deleteMany({
                    where: {
                        quizId,
                    },
                });

                return await tx.quiz.update({
                    where: {
                        id: quizId,
                    },
                    data: {
                        title: quiz_data.title,
                        description: quiz_data.description,
                        prizePool: quiz_data.prizePool,
                        currency: quiz_data.currency,
                        basePointsPerQuestion: quiz_data.basePointsPerQuestion,
                        pointsMultiplier: quiz_data.pointsMultiplier,
                        timeBonus: quiz_data.timeBonus,
                        eliminationThreshold: quiz_data.eliminationThreshold,
                        questionTimeLimit: quiz_data.questionTimeLimit,
                        breakBetweenQuestions: quiz_data.breakBetweenQuestions,
                        scheduledAt: quiz_data.scheduledAt
                            ? new Date(quiz_data.scheduledAt)
                            : undefined,
                        autoSave: quiz_data.autoSave,
                        liveChat: quiz_data.liveChat,
                        spectatorMode: quiz_data.spectatorMode,
                        questions: {
                            create: questions,
                        },
                    },
                });
            });

            const response: quiz_controller = {
                type: QUIZ_STATUS.UPDATE_QUIZ,
                success: true,
                quiz: quiz,
            };

            return response;
        } catch (error) {
            return this.handle_error(QUIZ_STATUS.UPDATE_QUIZ, error);
        }
    }

    // add host auth
    private async handle_publish_quiz(
        quizId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
        hostId: number,
    ): Promise<quiz_controller> {
        try {
            const quiz = await this.find_quiz(quizId);
            let publishing_quiz;

            // if quiz exists, update the quiz
            if (quiz) {
                // add checks for other status types

                // don't update if live or publish
                if (quiz.status === 'LIVE' || quiz.status === 'PUBLISHED') {
                    return {
                        type: QUIZ_STATUS.PUBLISH_QUIZ,
                        success: false,
                        status: quiz.status,
                    };
                }

                const isValidOwner = await QuizAction.validOwner(hostId, quizId);

                if (!isValidOwner) {
                    return {
                        type: QUIZ_STATUS.PUBLISH_QUIZ,
                        success: false,
                        isHost: false,
                    };
                }

                const data = await this.handle_update_quiz(quizId, quiz_data, questions);

                if (!data.quiz) {
                    return {
                        type: QUIZ_STATUS.PUBLISH_QUIZ,
                        success: false,
                        error: data.error,
                    };
                }

                publishing_quiz = await prisma.quiz.update({
                    where: {
                        id: data.quiz.id,
                    },
                    data: {
                        status: 'PUBLISHED',
                    },
                });
            } else {
                // create the quiz
                const data = await this.handle_save_new_quiz(quizId, quiz_data, questions, hostId);

                if (!data.quiz) {
                    return {
                        type: QUIZ_STATUS.PUBLISH_QUIZ,
                        success: false,
                    };
                }

                publishing_quiz = await prisma.quiz.update({
                    where: {
                        id: data.quiz.id,
                    },
                    data: {
                        status: 'PUBLISHED',
                    },
                });
            }

            const response = {
                type: QUIZ_STATUS.PUBLISH_QUIZ,
                success: true,
                quiz: publishing_quiz,
            };

            return response;
        } catch (error) {
            return this.handle_error(QUIZ_STATUS.PUBLISH_QUIZ, error);
        }
    }

    // add host auth
    private async handle_launch_quiz(
        quizId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
        hostId: number,
    ): Promise<quiz_controller> {
        try {
            const quiz = await this.find_quiz(quizId);
            let launching_quiz: { quiz: Partial<Quiz>; gameSession: Partial<GameSession> };

            if (quiz?.status === 'LIVE') {
                return {
                    type: QUIZ_STATUS.LAUNCH_QUIZ,
                    success: false,
                    status: quiz.status,
                };
            }

            if (quiz?.status === 'PUBLISHED') {
                // validate owner
                const isValidOwner = await QuizAction.validOwner(hostId, quizId);

                if (!isValidOwner) {
                    return {
                        type: QUIZ_STATUS.LAUNCH_QUIZ,
                        success: false,
                        isHost: false,
                    };
                }

                launching_quiz = await this.launch_quiz_tx(quiz?.id);
            } else {
                const data = await this.handle_publish_quiz(quizId, quiz_data, questions, hostId);

                if (!data.quiz) {
                    return {
                        type: QUIZ_STATUS.LAUNCH_QUIZ,
                        success: false,
                        error: data.error,
                    };
                }

                launching_quiz = await this.launch_quiz_tx(data.quiz.id!);
            }

            const response: quiz_controller = {
                type: QUIZ_STATUS.LAUNCH_QUIZ,
                success: true,
                quiz: launching_quiz.quiz,
                gameSession: launching_quiz.gameSession,
            };

            return response;
        } catch (error) {
            return this.handle_error(QUIZ_STATUS.LAUNCH_QUIZ, error);
        }
    }

    private async launch_quiz_tx(
        quizId: string,
    ): Promise<{ quiz: Partial<Quiz>; gameSession: Partial<GameSession> }> {
        const result = await prisma.$transaction(async (tx) => {
            const participantCode = await QuizAction.generateUniqueCode('participant');
            const spectatorCode = await QuizAction.generateUniqueCode('spectator');

            const quiz = await tx.quiz.update({
                where: {
                    id: quizId,
                },
                data: {
                    status: 'LIVE',
                    startedAt: new Date(),
                    participantCode,
                    spectatorCode,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    theme: true,
                    status: true,
                    questionTimeLimit: true,
                    breakBetweenQuestions: true,
                    eliminationThreshold: true,
                    timeBonus: true,
                    liveChat: true,
                    spectatorMode: true,
                    basePointsPerQuestion: true,
                    pointsMultiplier: true,
                    prizePool: true,
                    currency: true,
                    _count: {
                        select: {
                            questions: true,
                            participants: true,
                        },
                    },
                },
            });

            const gameSession = await tx.gameSession.create({
                data: {
                    quizId: quizId,
                    hostScreen: 'LOBBY',
                    participantScreen: 'LOBBY',
                    questionStartedAt: new Date(),
                    status: 'WAITING',
                },
                select: {
                    id: true,
                    status: true,
                    hostScreen: true,
                    participantScreen: true,
                    totalParticipants: true,
                    activeParticipants: true,
                    currentQuestionIndex: true,
                },
            });
            return { quiz, gameSession };
        });

        return result;
    }

    private async find_quiz(quizId: string): Promise<Quiz | null> {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
            },
        });

        return quiz;
    }

    private handle_error(type: QUIZ_STATUS, error: unknown): quiz_controller {
        const response: quiz_controller = {
            type,
            success: false,
            error,
        };
        return response;
    }
}
