import {
    ApiResponse,
    LiveGameTokenPayload,
    NOCTURN_COOKIE_NAME,
    QuestionType,
    USER_TYPE,
} from '@nocturn/types';
import { parse } from 'cookie';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import QuizAction from '../../class/quizAction';
import { HostScreen, prisma } from '@nocturn/database';
import getChatsController from '../chat-controller/getChatsController';

export default async function getQuizDataController(req: Request, res: Response) {
    const cookieHeader = req.headers.cookie;
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies[NOCTURN_COOKIE_NAME];
    const { quizId: quizIdParams } = req.params;

    if (!token) {
        ResponseWriter.not_authorized(res);
        return;
    }
    try {
        const decoded = QuizAction.verifyCookie(token);
        if (typeof decoded !== 'object' || !decoded) return ResponseWriter.not_authorized(res);

        const { quizId, gameSessionId, role, userId } = decoded as LiveGameTokenPayload;

        if (!quizId || !gameSessionId || !role || !quizIdParams || quizIdParams !== quizId) {
            return ResponseWriter.not_authorized(res);
        }

        const result = await prisma.$transaction(async (tx) => {
            const gameSession = await tx.gameSession.findUnique({
                where: {
                    id: gameSessionId,
                    quizId: quizId,
                },
                select: {
                    id: true,
                    status: true,
                    hostScreen: true,
                    participantScreen: true,
                    spectatorScreen: true,
                    totalParticipants: true,
                    activeParticipants: true,
                    currentQuestionIndex: true,
                    currentQuestionId: true,
                    totalSpectators: true,
                    avgResponseTime: true,
                    correctAnswerRate: true,
                    currentPhase: true,
                    phaseEndTime: true,
                    phaseStartTime: true,
                },
            });

            // if current phase is lobby then return only one question as current questoin
            // else return two questions, 1st current question, 2nd an unasked question
            const quiz = await tx.quiz.findUnique({
                where: {
                    id: quizId,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    template: true,
                    status: true,
                    questionTimeLimit: true,
                    breakBetweenQuestions: true,
                    eliminationThreshold: true,
                    timeBonus: true,
                    liveChat: true,
                    allowNewSpectator: true,
                    spectatorMode: true,
                    basePointsPerQuestion: true,
                    pointsMultiplier: true,
                    prizePool: true,
                    currency: true,
                    interactions: true,
                    ...(role === USER_TYPE.HOST && {
                        spectatorCode: true,
                        participantCode: true,
                    }),
                    _count: {
                        select: {
                            questions: true,
                            participants: true,
                        },
                    },
                    host: {
                        select: {
                            name: true,
                            image: true,
                            email: true,
                        },
                    },
                },
            });

            // this will be our current question
            let question;

            // get the question based on current quiz phase
            switch (gameSession?.hostScreen) {
                case HostScreen.LOBBY: {
                    // get a random question
                    question = await get_question(userId, quizId);
                    break;
                }
                default: {
                    question = await get_question(userId, quizId, gameSession?.currentQuestionId!);
                    break;
                }
            }

            const participants = await tx.participant.findMany({
                where: {
                    quizId: quizId,
                    isKicked: false,
                },
                select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                    totalScore: true,
                    finalRank: true,
                },
                take: 20,
            });

            const spectators = await tx.spectator.findMany({
                where: {
                    quizId: quizId,
                    isKicked: false,
                },
                select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                },
            });

            let userData = null;

            switch (role) {
                case USER_TYPE.HOST:
                    userData = await tx.user.findUnique({
                        where: { id: userId },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            walletAddress: true,
                            isVerified: true,
                        },
                    });
                    break;

                // returning the participant data if the participant is not kicked
                case USER_TYPE.PARTICIPANT:
                    userData = await tx.participant.findFirst({
                        where: {
                            quizId: quizId,
                            id: userId,
                            isKicked: false,
                        },
                        select: {
                            id: true,
                            nickname: true,
                            avatar: true,
                            isEliminated: true,
                            eliminatedAt: true,
                            isNameChanged: true,
                            eliminatedAtQuestion: true,
                            finalRank: true,
                            totalScore: true,
                            correctAnswers: true,
                            longestStreak: true,
                            walletAddress: true,
                        },
                    });
                    break;

                // returning the spectator data if the spectator is not kicked
                case USER_TYPE.SPECTATOR:
                    userData = await tx.spectator.findFirst({
                        where: {
                            quizId: quizId,
                            id: userId,
                            isKicked: false,
                        },
                        select: {
                            id: true,
                            nickname: true,
                            avatar: true,
                            joinedAt: true,
                        },
                    });
                    break;
            }

            return {
                gameSession,
                quiz,
                question,
                participants,
                spectators,
                userData,
            };
        });

        if (!result.quiz || !result.gameSession) {
            ResponseWriter.not_found(res, 'Quiz or Game session not found');
            return;
        }

        if (!result.userData) {
            ResponseWriter.not_found(res, `${role} data not found`);
            return;
        }

        const sanitizedGameSession = QuizAction.sanitizeGameSession(result.gameSession, role);
        const spectatorLink = QuizAction.createSpectatorLink(quizId);
        let currentQuestion;
        if (result.question) {
            currentQuestion = QuizAction.sanitizeCurrentQuestion(
                result.question,
                role,
                result.gameSession.hostScreen,
            );
        }

        const data = await getChatsController(role, gameSessionId, quizId);
        const responseData: any = {
            quiz: { ...result.quiz, spectatorLink },
            gameSession: sanitizedGameSession,
            userData: result.userData,
            participants: result.participants,
            spectators: result.spectators,
            currentQuestion: currentQuestion,
            role,
        };

        if (data.messages) {
            responseData.messages = data.messages;
        }
        ResponseWriter.secure_success(res, {
            type: ApiResponse.GET_LIVE_QUIZ_DATA,
            data: responseData,
        });
        return;
    } catch (error) {
        console.error('error in get live quiz data controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}

async function get_question(
    host_id: string,
    quiz_id: string,
    question_id?: string,
): Promise<Partial<QuestionType> | null> {
    // if question-id is not provided then return an unasked question
    if (!question_id) {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quiz_id,
                hostId: host_id,
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
                        hintLaunched: true,
                    },
                    orderBy: {
                        orderIndex: 'asc',
                    },
                    take: 1,
                },
            },
        });

        if (!quiz || quiz.questions.length === 0) return null;

        const question = quiz.questions[0];

        return {
            ...question,
            explanation: question.explanation || undefined,
            hint: question.hint || undefined,
            imageUrl: question.imageUrl || undefined,
        };
    } else {
        const question = await prisma.question.findUnique({
            where: {
                id: question_id,
                quizId: quiz_id,
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
        });

        if (!question) return null;

        return {
            ...question,
            explanation: question.explanation || undefined,
            hint: question.hint || undefined,
            imageUrl: question.imageUrl || undefined,
        };
    }
}
