import {
    ApiResponse,
    getLiveQuizDataResponse,
    LiveGameTokenPayload,
    LiveLeaderboardSnapshot,
    NOCTURN_COOKIE_NAME,
    ParticipantType,
    ResponseType,
    SpectatorType,
    USER_TYPE,
    UserType,
} from '@nocturn/types';
import { parse } from 'cookie';
import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import QuizAction from '../../class/quizAction';
import { HostScreen, prisma, Question } from '@nocturn/database';
import getChatsController from '../chat-controller/getChatsController';
import { redisCacheInstance } from '../../services/init.services';
import { QuestionType } from '../../schemas/createQuizSchema';

export default async function getLiveQuizDataController(req: Request, res: Response) {
    const cookieHeader = req.headers.cookie;
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies[NOCTURN_COOKIE_NAME];
    const { quizId: quizIdParams } = req.params;
    console.log('toke here is : ', token);

    if (!token) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const decoded = QuizAction.verifyCookie(token);
        console.log('decoded is : ', decoded);
        if (typeof decoded !== 'object' || !decoded) return ResponseWriter.not_authorized(res);

        const { quizId, gameSessionId, role, userId } = decoded as LiveGameTokenPayload;

        if (!quizId || !gameSessionId || !role || !quizIdParams || quizIdParams !== quizId) {
            return ResponseWriter.not_authorized(res);
        }

        const [batchResult] = await Promise.all([
            redisCacheInstance.get_live_quiz_batch(
                gameSessionId,
                ['id', 'nickname', 'avatar', 'totalScore', 'finalRank'],
                ['id', 'nickname', 'avatar'],
            ),
        ]);

        const { gameSession, quiz, cachedParticipants, cachedSpectators } = batchResult;

        if (!gameSession || !quiz) {
            console.log(
                'fall backing to the database for quiz data - cache miss for gameSession or quiz',
            );
            return await fallbackToDatabase(res, quizId, gameSessionId, role, userId);
        }

        const questions = quiz.questions || [];
        let question: Question | null = null;

        if (gameSession.hostScreen === HostScreen.LOBBY) {
            const unasked = questions
                .filter((q) => !q.isAsked)
                .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
            question = unasked[0] ?? null;
        } else if (gameSession.currentQuestionId) {
            question = questions.find((q) => q.id === gameSession.currentQuestionId) ?? null;
        }

        let userData: Partial<UserType> | Partial<ParticipantType> | Partial<SpectatorType> | null =
            null;
        let participantResponse: Partial<ResponseType> | null = null;
        const askedQuestionCount = questions.filter((q) => q.isAsked).length;

        switch (role) {
            case USER_TYPE.HOST: {
                userData = await redisCacheInstance.get_host(gameSessionId, userId, [
                    'id',
                    'name',
                    'email',
                    'image',
                    'walletAddress',
                    'isVerified',
                ]);
                if (!userData) {
                    userData = await prisma.user.findUnique({
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
                }
                break;
            }

            case USER_TYPE.PARTICIPANT: {
                const participant = await redisCacheInstance.get_participant(gameSessionId, userId);
                if (participant && !participant.isKicked) {
                    userData = {
                        id: participant.id,
                        nickname: participant.nickname,
                        avatar: participant.avatar,
                        isEliminated: participant.isEliminated,
                        eliminatedAt: participant.eliminatedAt,
                        isNameChanged: participant.isNameChanged,
                        eliminatedAtQuestion: participant.eliminatedAtQuestion,
                        finalRank: participant.finalRank,
                        totalScore: participant.totalScore,
                        correctAnswers: participant.correctAnswers,
                        longestStreak: participant.longestStreak,
                        walletAddress: participant.walletAddress,
                    };
                }

                const currentQuestionId = gameSession.currentQuestionId;
                if (currentQuestionId && userData?.id) {
                    participantResponse = await redisCacheInstance.get_participant_response(
                        gameSessionId,
                        currentQuestionId,
                        userData.id,
                    );
                }
                break;
            }

            case USER_TYPE.SPECTATOR: {
                const spectator = await redisCacheInstance.get_spectator(gameSessionId, userId);
                if (spectator && !spectator.isKicked) {
                    userData = {
                        id: spectator.id,
                        nickname: spectator.nickname,
                        avatar: spectator.avatar,
                        joinedAt: spectator.joinedAt,
                    };
                }
                break;
            }
        }

        if (!userData) {
            ResponseWriter.not_found(res, `${role} data not found`);
            return;
        }

        const sanitizedGameSession = QuizAction.sanitizeGameSession(gameSession, role);

        let currentQuestion: Partial<QuestionType> | null = null;
        if (question) {
            currentQuestion = withQuestionId(
                QuizAction.sanitizeCurrentQuestion(
                    question as unknown as Partial<QuestionType>,
                    role,
                    gameSession.hostScreen as HostScreen,
                ),
                question.id,
            );
        }

        const [leaderboard, responses] = await Promise.all([
            getCachedLeaderboard(gameSessionId, role, userData.id as string),
            getResultsPhaseResponses(
                gameSessionId,
                gameSession.hostScreen as HostScreen,
                gameSession.currentQuestionId,
            ),
        ]);

        const quizResponse: Record<string, unknown> = {
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            template: quiz.template,
            status: quiz.status,
            questionTimeLimit: quiz.questionTimeLimit,
            breakBetweenQuestions: quiz.breakBetweenQuestions,
            eliminationThreshold: quiz.eliminationThreshold,
            timeBonus: quiz.timeBonus,
            liveChat: quiz.liveChat,
            allowNewSpectator: quiz.allowNewSpectator,
            spectatorMode: quiz.spectatorMode,
            basePointsPerQuestion: quiz.basePointsPerQuestion,
            pointsMultiplier: quiz.pointsMultiplier,
            prizePool: quiz.prizePool,
            currency: quiz.currency,
            interactions: quiz.interactions,
            _count: {
                questions: questions.length,
                participants: cachedParticipants.length,
            },
            host: quiz.host ?? null,
            spectatorLink: quiz.spectatorLink ?? null,
        };

        if (role === USER_TYPE.HOST) {
            quizResponse.spectatorCode = quiz.spectatorCode;
            quizResponse.participantCode = quiz.participantCode;
        }

        const responseData = {
            quiz: quizResponse,
            gameSession: sanitizedGameSession,
            userData,
            participants: cachedParticipants.slice(0, 20),
            spectators: cachedSpectators,
            currentQuestion,
            role,
            response: participantResponse,
            askedQuestionCount: role === USER_TYPE.HOST ? askedQuestionCount : null,
            leaderboard,
            responses,
        };

        ResponseWriter.secure_success(res, {
            type: ApiResponse.GET_LIVE_QUIZ_DATA,
            data: responseData as unknown as getLiveQuizDataResponse,
        });
        return;
    } catch (error) {
        console.error('error in get live quiz data controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}

async function fallbackToDatabase(
    res: Response,
    quizId: string,
    gameSessionId: string,
    role: USER_TYPE,
    userId: string,
) {
    const result = await prisma.$transaction(async (tx) => {
        const gameSession = await tx.gameSession.findUnique({
            where: { id: gameSessionId, quizId },
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

        const quiz = await tx.quiz.findUnique({
            where: { id: quizId },
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
                    spectatorLink: true,
                }),
                _count: {
                    select: {
                        questions: true,
                        participants: true,
                    },
                },
                host: {
                    select: { name: true, image: true, email: true },
                },
            },
        });

        const askedQuestionCount = await tx.question.count({
            where: {
                quizId,
                isAsked: true,
            },
        });

        let question: Question | null = null;
        if (gameSession?.hostScreen === 'LOBBY') {
            const q = await tx.question.findFirst({
                where: { quizId, isAsked: false },
                orderBy: { orderIndex: 'asc' },
            });
            question = q;
        } else if (gameSession?.currentQuestionId) {
            question = await tx.question.findUnique({
                where: { id: gameSession.currentQuestionId, quizId },
            });
        }

        const participants = await tx.participant.findMany({
            where: { quizId, isKicked: false },
            select: {
                id: true,
                nickname: true,
                avatar: true,
                totalScore: true,
                finalRank: true,
            },
            orderBy: { totalScore: 'desc' },
            take: 20,
        });

        const spectators = await tx.spectator.findMany({
            where: { quizId, isKicked: false },
            select: { id: true, nickname: true, avatar: true },
        });

        let userData = null;
        let participantResponse = null;

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
            case USER_TYPE.PARTICIPANT: {
                userData = await tx.participant.findFirst({
                    where: { quizId, id: userId, isKicked: false },
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
                if (gameSession?.currentQuestionId && userData?.id) {
                    participantResponse = await tx.response.findFirst({
                        where: {
                            gameSessionId,
                            participantId: userData.id,
                            questionId: gameSession.currentQuestionId,
                        },
                        select: {
                            id: true,
                            selectedAnswer: true,
                            isCorrect: true,
                            pointsEarned: true,
                            timeToAnswer: true,
                        },
                    });
                }
                break;
            }
            case USER_TYPE.SPECTATOR:
                userData = await tx.spectator.findFirst({
                    where: { quizId, id: userId, isKicked: false },
                    select: { id: true, nickname: true, avatar: true, joinedAt: true },
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
            participantResponse,
            askedQuestionCount,
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
    let currentQuestion: Partial<QuestionType> | null = null;
    if (result.question) {
        currentQuestion = withQuestionId(
            QuizAction.sanitizeCurrentQuestion(
                result.question as unknown as Partial<QuestionType>,
                role,
                result.gameSession.hostScreen,
            ),
            result.question.id,
        );
    }

    const [chatData, cachedLeaderboard, responses] = await Promise.all([
        getChatsController(role, gameSessionId, quizId),
        getCachedLeaderboard(gameSessionId, role, result.userData.id),
        getResultsPhaseResponses(
            gameSessionId,
            result.gameSession.hostScreen,
            result.gameSession.currentQuestionId,
        ),
    ]);

    // the leaderboard ZSET may have been evicted along with the session, rebuild it from the database
    const leaderboard =
        cachedLeaderboard.totalParticipants > 0
            ? cachedLeaderboard
            : await getDatabaseLeaderboard(
                  quizId,
                  role,
                  result.participants,
                  result.userData as { id: string; totalScore?: number },
              );

    const responseData = {
        quiz: result.quiz,
        gameSession: sanitizedGameSession,
        userData: result.userData,
        participants: result.participants,
        spectators: result.spectators,
        currentQuestion,
        role,
        response: result.participantResponse,
        askedQuestionCount: role === USER_TYPE.HOST ? result.askedQuestionCount : null,
        leaderboard,
        responses,
        ...(chatData.messages && { messages: chatData.messages }),
    };

    ResponseWriter.secure_success(res, {
        type: ApiResponse.GET_LIVE_QUIZ_DATA,
        data: responseData as unknown as getLiveQuizDataResponse,
    });
}

// sanitizeCurrentQuestion drops the id for non-host roles, but the client needs it to tell
// whether a resync landed on a different question than the one it had on screen
function withQuestionId(
    question: Partial<QuestionType> | null,
    id: string,
): (Partial<QuestionType> & { id: string }) | null {
    return question ? { ...question, id } : null;
}

async function getCachedLeaderboard(
    gameSessionId: string,
    role: USER_TYPE,
    userId: string,
): Promise<LiveLeaderboardSnapshot> {
    const isParticipant = role === USER_TYPE.PARTICIPANT;
    const [topScores, totalParticipants, myRank, myScore] = await Promise.all([
        redisCacheInstance.get_top_leaderboards(gameSessionId, 10),
        redisCacheInstance.get_leaderboard_count(gameSessionId),
        isParticipant ? redisCacheInstance.get_participant_rank(gameSessionId, userId) : null,
        isParticipant ? redisCacheInstance.get_participant_score(gameSessionId, userId) : null,
    ]);
    return { topScores, totalParticipants, myRank, myScore };
}

async function getDatabaseLeaderboard(
    quizId: string,
    role: USER_TYPE,
    participants: {
        id: string;
        nickname: string;
        avatar: string | null;
        totalScore: number;
    }[],
    userData: { id: string; totalScore?: number },
): Promise<LiveLeaderboardSnapshot> {
    const topScores = participants.slice(0, 10).map((participant, index) => ({
        id: participant.id,
        totalScore: participant.totalScore,
        rank: index + 1,
        nickname: participant.nickname,
        avatar: participant.avatar,
    }));

    const totalParticipants = await prisma.participant.count({
        where: { quizId, isKicked: false },
    });

    let myRank: number | null = null;
    let myScore: number | null = null;
    if (role === USER_TYPE.PARTICIPANT) {
        myScore = userData.totalScore ?? 0;
        const ahead = await prisma.participant.count({
            where: { quizId, isKicked: false, totalScore: { gt: myScore } },
        });
        myRank = ahead + 1;
    }

    return { topScores, totalParticipants, myRank, myScore };
}

async function getResultsPhaseResponses(
    gameSessionId: string,
    hostScreen: HostScreen | null | undefined,
    currentQuestionId: string | null | undefined,
): Promise<Partial<ResponseType>[] | null> {
    if (hostScreen !== HostScreen.QUESTION_RESULTS || !currentQuestionId) return null;
    return redisCacheInstance.get_all_question_responses(gameSessionId, currentQuestionId, [
        'isCorrect',
        'selectedAnswer',
        'pointsEarned',
    ]);
}
