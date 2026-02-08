import { Request, Response } from 'express';
import { parse } from 'cookie';
import { prisma, QuizPhase } from '@nocturn/database';
import { LiveGameTokenPayload, NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import QuizAction from '../../class/quizAction';
import getChatsController from '../chat-controller/getChatsController';
import ResponseWriter from '../../class/response_writer';

export default async function getLiveQuizDataController(req: Request, res: Response) {
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
            const quiz = await tx.quiz.findUnique({
                where: { id: quizId },
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
                    ...(role === USER_TYPE.HOST && {
                        questions: {
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
                            where: {
                                isAsked: false,
                            },
                            orderBy: {
                                orderIndex: 'asc',
                            },
                            take: 1,
                        },
                    }),
                },
            });

            // currentQuestion might be null if all the questions are asked
            const currentQ = quiz?.questions?.[0];

            const gameSession = await tx.gameSession.findUnique({
                where: { id: gameSessionId },
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

            // fetch the current question with currentQuestionId
            if (gameSession?.currentQuestionId) {
                const currentQuestion = await tx.question.findUnique({
                    where: {
                        id: gameSession?.currentQuestionId,
                    },
                });
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

            let question;
            const questionId: string | null | undefined = gameSession?.currentQuestionId;

            if (questionId) {
                question = await tx.question.findUnique({
                    where: {
                        id: questionId,
                    },
                    select: {
                        id: true,
                        question: true,
                        orderIndex: role === USER_TYPE.HOST,
                        ...(questionId &&
                            (gameSession?.currentPhase === QuizPhase.QUESTION_ACTIVE ||
                                gameSession?.currentPhase === QuizPhase.SHOW_RESULTS) && {
                                options: true,
                            }),
                    },
                });
            }

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

            // Role-specific data
            let userData = null;
            let isNextQuestionAvailable = false;

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
                    isNextQuestionAvailable = !!quiz?.questions.find((q) => !q.isAsked);
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
                quiz,
                gameSession,
                userData,
                participants,
                spectators,
                currentQ,
                question,
                isNextQuestionAvailable,
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

        const data = await getChatsController(role, gameSessionId, quizId);
        const responseData: any = {
            success: true,
            quiz: { ...result.quiz, spectatorLink },
            gameSession: sanitizedGameSession,
            userData: result.userData,
            participants: result.participants,
            spectators: result.spectators,
            currentQ: result.currentQ,
            role,
            question: result.question,
            isNextQuestionAvailable: result.isNextQuestionAvailable,
        };

        if (data.messages) {
            responseData.messages = data.messages;
        }
        ResponseWriter.success(res, responseData);
        return;
    } catch (err) {
        console.error('Unexpected error in getLiveQuizDataController:', err);
        ResponseWriter.system_error(res);
        return;
    }
}
