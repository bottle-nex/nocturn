import Redis from 'ioredis';
import {
    IncomingChatMessage,
    IncomingChatReaction,
    LiveGameTokenPayload,
    MESSAGE_TYPES,
    PubSubMessageTypes,
    QuizEndScreen,
    SECONDS,
    SessionStatusEnum,
    USER_TYPE,
} from '@nocturn/types';
import { CustomWebSocket, GameWebSocket } from '../types/web-socket-types';
import QuizManager from './QuizManager';
import {
    prisma,
    Prisma,
    withGameSessionLock,
    HostScreen,
    ParticipantScreen,
    SpectatorScreen,
    QuizPhase,
    QuizStatus,
} from '@nocturn/database';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { WebSocket } from 'ws';
import DatabaseQueue from '../queue/database/database.queue';
import RedisCache from '../cache/redis.cache';
import PhaseQueue from '../queue/PhaseQueue';
import QuizSettings from '../class/quizSettings';
import { quizSettingInstance } from '../services/init.services';
import { socket_codes } from '@nocturn/types';
export interface HostManagerDependencies {
    publisher: Redis;
    subscriber: Redis;
    socketMapping: Map<string, CustomWebSocket>;
    sessionHostMapping: Map<string, string>;
    quizManager: QuizManager;
    databaseQueue: DatabaseQueue;
    redis_cache: RedisCache;
    phase_queue: PhaseQueue;
}

export default class HostManager {
    private socketMapping: Map<string, CustomWebSocket>;
    private sessionHostMapping: Map<string, string>;
    private quizManager: QuizManager;
    private database_queue: DatabaseQueue;
    private redis_cache: RedisCache;
    private phase_queue: PhaseQueue;
    private quiz_settings: QuizSettings;

    constructor(dependencies: HostManagerDependencies) {
        this.socketMapping = dependencies.socketMapping;
        this.sessionHostMapping = dependencies.sessionHostMapping;
        this.quizManager = dependencies.quizManager;
        this.database_queue = dependencies.databaseQueue;
        this.redis_cache = dependencies.redis_cache;
        this.phase_queue = dependencies.phase_queue;
        this.quiz_settings = quizSettingInstance;
    }

    public async handle_connection(
        ws: GameWebSocket,
        payload: LiveGameTokenPayload,
    ): Promise<void> {
        const isValidHost = await this.validateHostInDB(payload.quizId, payload.userId);
        if (!isValidHost) {
            ws.close();
            return;
        }

        const existing_host_socket_id = this.sessionHostMapping.get(payload.gameSessionId);
        if (existing_host_socket_id) {
            const host_existing_socket = this.socketMapping.get(existing_host_socket_id);
            if (host_existing_socket && host_existing_socket.readyState === WebSocket.OPEN) {
                host_existing_socket.close(
                    socket_codes.DUPLICATE_CONNECTION,
                    'Another host has connected',
                );
            }
        }

        ws.user = payload as LiveGameTokenPayload;
        ws.id = this.generateSocketId();
        this.socketMapping.set(ws.id, ws);
        this.sessionHostMapping.set(payload.gameSessionId, ws.id);
        this.setup_message_handlers(ws);
        await this.quiz_settings.seed_settings_for_session(payload.gameSessionId);
    }

    private setup_message_handlers(ws: GameWebSocket) {
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handle_host_message(ws, message);
            } catch (err) {
                console.error('Error parsing message', err);
            }
        });

        ws.on('close', () => {
            try {
                const gameSessionId = ws.user.gameSessionId;
                if (!gameSessionId) return;

                const mappedSocketID = this.sessionHostMapping.get(gameSessionId);
                if (mappedSocketID === ws.id) {
                    this.socketMapping.delete(gameSessionId);
                }
                this.socketMapping.delete(ws.id);
            } catch (error) {
                console.error('Error in closing host scket', error);
                return;
            }
        });
    }

    private handle_host_message(ws: GameWebSocket, message: any) {
        const { type, payload } = message;
        switch (type) {
            case MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW:
                this.handle_host_question_preview_page_change(ws);
                break;

            case MESSAGE_TYPES.INTERACTION_EVENT:
                this.handle_incoming_interaction_event(payload, ws);
                break;

            case MESSAGE_TYPES.HOST_LAUNCH_QUESTION:
                this.handle_question_launch(payload, ws);
                break;

            case MESSAGE_TYPES.CHAT_MESSAGE:
                this.handle_send_chat_message(payload, ws);
                break;

            case MESSAGE_TYPES.CHAT_REACTION_EVENT:
                this.handle_incoming_chat_reaction_event(payload, ws);
                break;

            case MESSAGE_TYPES.HOST_EMITS_HINT:
                this.handle_host_emits_hint(payload, ws);
                break;

            case MESSAGE_TYPES.SETTINGS_CHANGE:
                this.handle_settings_change(ws, payload);
                break;

            case MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS:
                this.handle_quiz_results(ws);
                break;

            case MESSAGE_TYPES.UPDATE_CURRENT_QUESTION:
                this.handle_update_current_question(ws, payload);
                break;

            case MESSAGE_TYPES.ADVANCE_QUIZ_END_SCREEN:
                this.handle_advance_quiz_end_screen(ws);
                break;

            default:
                console.error('Unknown message type', type);
                break;
        }
    }

    private async handle_host_emits_hint(payload: any, ws: GameWebSocket) {
        const { questionId: question_id } = payload;
        if (ws.user.role !== USER_TYPE.HOST) {
            return;
        }
        const quiz = await this.redis_cache.get_quiz(ws.user.gameSessionId);
        const question = quiz?.questions?.find((q) => q.id === question_id);
        if (!question || !question.hint) {
            return;
        }

        this.database_queue.update_question(ws.user.gameSessionId, question.id, {
            hintLaunched: true,
        });

        const hint = question.hint;
        const hintPayload: PubSubMessageTypes = {
            type: MESSAGE_TYPES.HOST_EMITS_HINT,
            payload: {
                hint,
            },
        };
        this.quizManager.publish_event_to_redis(ws.user.gameSessionId, hintPayload);
    }

    private handle_settings_change(ws: GameWebSocket, payload: any): void {
        this.quiz_settings.update_quiz_settings_on_db_and_cache(
            ws.user.gameSessionId,
            ws.user.quizId,
            ws.user.userId,
            payload,
        );
    }

    private handle_incoming_interaction_event(payload: any, ws: GameWebSocket): void {
        const { reactionType } = payload;
        const published_message: PubSubMessageTypes = {
            type: MESSAGE_TYPES.INTERACTION_EVENT,
            payload: {
                reactionType,
            },
            exclude_socket_id: ws.id,
        };
        this.quizManager.publish_event_to_redis(ws.user.gameSessionId, published_message);
    }

    private async handle_question_launch(payload: any, ws: GameWebSocket) {
        const { questionId, questionIndex } = payload;

        const { gameSessionId: game_session_id } = ws.user;
        return withGameSessionLock(game_session_id, async (tx) => {
            const session = await tx.gameSession.findUnique({ where: { id: game_session_id } });
            if (
                !session ||
                session.currentPhase === QuizPhase.QUESTION_ACTIVE ||
                session.currentPhase === QuizPhase.QUESTION_READING ||
                session.currentPhase === QuizPhase.QUIZ_RESULTS
            )
                return;
            const quiz = await tx.quiz.findUnique({
                where: { id: ws.user.quizId },
                include: { questions: true },
            });

            if (!quiz) {
                throw new Error("Quiz doesn't exist in game_session");
            }

            const question = quiz.questions?.find(
                (q) => q.id === questionId && q.orderIndex === questionIndex,
            );

            if (!question) throw new Error("Questions doesn't exist in quiz");

            if (question.isAsked) {
                const pub_sub_message_to_host: PubSubMessageTypes = {
                    type: MESSAGE_TYPES.QUESTION_ALREADY_ASKED,
                    payload: {
                        error: 'Question is already asked',
                        questionId: questionId,
                        questionIndex: questionIndex,
                    },
                    only_socket_id: ws.id,
                };
                await this.quizManager.publish_event_to_redis(
                    game_session_id,
                    pub_sub_message_to_host,
                );
                return;
            }

            const now = Date.now();
            const buffer = 2 * SECONDS;
            const question_reading_time = question.readingTime * SECONDS;

            const start_time = now + buffer;
            const end_time = start_time + question_reading_time;

            const updatedSession = await tx.gameSession.update({
                where: { id: game_session_id },
                data: {
                    currentQuestionIndex: questionIndex,
                    currentQuestionId: questionId,
                    hostScreen: HostScreen.QUESTION_READING,
                    spectatorScreen: SpectatorScreen.QUESTION_READING,
                    participantScreen: ParticipantScreen.QUESTION_READING,
                    phaseStartTime: new Date(start_time),
                    phaseEndTime: new Date(end_time),
                    currentPhase: QuizPhase.QUESTION_READING,
                },
            });
            await tx.question.update({ where: { id: questionId }, data: { isAsked: true } });
            question.isAsked = true;
            await this.redis_cache.set_game_session(game_session_id, updatedSession);
            await this.redis_cache.set_quiz(game_session_id, quiz);

            const pub_sub_message_to_participant: PubSubMessageTypes = {
                type: MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT,
                payload: {
                    currentQuestionIndex: questionIndex,
                    currentQuestionId: questionId,
                    questionTitle: question.question,
                    startTime: start_time,
                    endTime: end_time,
                    currentPhase: QuizPhase.QUESTION_READING,
                    participantScreen: ParticipantScreen.QUESTION_READING,
                },
            };
            await this.quizManager.publish_event_to_redis(
                game_session_id,
                pub_sub_message_to_participant,
            );

            const pub_sub_message_to_host: PubSubMessageTypes = {
                type: MESSAGE_TYPES.QUESTION_READING_PHASE_TO_HOST,
                payload: {
                    currentQuestionIndex: questionIndex,
                    currentQuestionId: questionId,
                    questionTitle: question.question,
                    startTime: start_time,
                    endTime: end_time,
                    currentPhase: QuizPhase.QUESTION_READING,
                    hostScreen: HostScreen.QUESTION_READING,
                },
            };
            await this.quizManager.publish_event_to_redis(game_session_id, pub_sub_message_to_host);

            const pub_sub_message_to_spectator: PubSubMessageTypes = {
                type: MESSAGE_TYPES.QUESTION_READING_PHASE_TO_SPECTATOR,
                payload: {
                    currentQuestionIndex: questionIndex,
                    currentQuestionId: questionId,
                    questionTitle: question.question,
                    startTime: start_time,
                    endTime: end_time,
                    currentPhase: QuizPhase.QUESTION_READING,
                    spectatorScreen: SpectatorScreen.QUESTION_READING,
                },
            };
            await this.quizManager.publish_event_to_redis(
                game_session_id,
                pub_sub_message_to_spectator,
            );

            await this.phase_queue.schedule_phase_transition({
                gameSessionId: game_session_id,
                questionId,
                questionIndex,
                fromPhase: QuizPhase.QUESTION_READING,
                toPhase: QuizPhase.QUESTION_ACTIVE,
                executeAt: end_time,
            });
        });
    }

    private async handle_host_question_preview_page_change(ws: GameWebSocket) {
        const { gameSessionId: game_session_id } = ws.user;
        await withGameSessionLock(game_session_id, async (tx) => {
            const session = await tx.gameSession.findUnique({ where: { id: game_session_id } });
            if (
                !session ||
                session.currentPhase === QuizPhase.QUESTION_ACTIVE ||
                session.currentPhase === QuizPhase.QUESTION_READING ||
                session.currentPhase === QuizPhase.QUIZ_RESULTS
            )
                return;
            const updatedSession = await tx.gameSession.update({
                where: { id: game_session_id },
                data: {
                    hostScreen: HostScreen.QUESTION_PREVIEW,
                    spectatorScreen: SpectatorScreen.QUESTION_MOTIVATION,
                    participantScreen: ParticipantScreen.QUESTION_MOTIVATION,
                    status: SessionStatusEnum.LIVE,
                },
            });
            await this.redis_cache.set_game_session(game_session_id, updatedSession);

            const event_data: PubSubMessageTypes = {
                type: MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW,
                payload: {
                    id: ws.user.userId,
                    screen: ParticipantScreen.QUESTION_MOTIVATION,
                },
            };

            await this.quizManager.publish_event_to_redis(game_session_id, event_data);
        });
    }

    private async handle_send_chat_message(payload: IncomingChatMessage, ws: GameWebSocket) {
        const { gameSessionId, quizId, userId: sender_id, role: sender_role } = ws.user;
        const { senderName, message, repliedToId, senderAvatar } = payload;

        if (!quizId || !sender_id || !message) {
            console.error('Missing required fields in chat message payload:', {
                quizId,
                message,
            });
            return;
        }

        const chatMessage = {
            senderId: sender_id,
            senderRole: String(sender_role),
            senderName: senderName,
            senderAvatar: senderAvatar,
            message,
            repliedToId: repliedToId ?? null,
        };

        const event_data: PubSubMessageTypes = {
            type: MESSAGE_TYPES.CHAT_MESSAGE,
            payload: {
                id: ws.user.userId,
                payload: payload,
            },
            exclude_socket_id: ws.id,
        };

        this.quizManager.publish_event_to_redis(gameSessionId, event_data);

        this.database_queue
            .create_chat_message(gameSessionId, gameSessionId, quizId, chatMessage)
            .catch((err) => {
                console.error('Failed to enqueue chat message:', err);
            });
    }

    private handle_incoming_chat_reaction_event(payload: IncomingChatReaction, ws: GameWebSocket) {
        const { userId, gameSessionId: game_session_id } = ws.user;
        const { chatMessageId, reactedAt, reaction, reactorAvatar, reactorName, reactorType } =
            payload;

        const is_chat_allowed = this.quiz_settings.quiz_settings_mapping.get(
            ws.user.gameSessionId,
        )?.liveChat;
        if (!is_chat_allowed) return;

        if (!chatMessageId) {
            console.error('Missing required fields in chat reactuon payload:', {
                chatMessageId,
            });
            return;
        }

        const chatReaction = {
            reaction,
            reactedAt,
            reactorName,
            reactorAvatar,
            reactorType,
        };

        const published_message: PubSubMessageTypes = {
            type: MESSAGE_TYPES.CHAT_REACTION_EVENT,
            payload: {
                chatMessageId,
                reaction,
                reactedAt,
                reactorName,
                reactorAvatar,
                reactorType,
            },
            exclude_socket_id: ws.id,
        };

        this.quizManager.publish_event_to_redis(game_session_id, published_message);

        this.database_queue
            .create_chat_reaction(userId, chatMessageId, chatReaction)
            .catch((err) => {
                console.error('Failed to enqueue chat reaction: ', err);
            });
    }

    private async handle_quiz_results(ws: GameWebSocket) {
        const { gameSessionId: game_session_id, quizId: quiz_id } = ws.user;
        try {
            const result = await withGameSessionLock(game_session_id, async (tx) => {
                const session = await tx.gameSession.findUniqueOrThrow({
                    where: { id: game_session_id },
                });
                const quiz = await tx.quiz.findUniqueOrThrow({
                    where: { id: quiz_id },
                    include: { questions: true },
                });
                const alreadyEnded = session.currentPhase === QuizPhase.QUIZ_RESULTS;
                if (
                    !alreadyEnded &&
                    (!quiz.questions.length ||
                        quiz.questions.some((q) => !q.isAsked) ||
                        session.currentPhase !== QuizPhase.SHOW_RESULTS ||
                        session.hostScreen !== HostScreen.QUESTION_RESULTS)
                ) {
                    throw new Error('Wait for the last question results before ending the quiz.');
                }
                const rankable = await tx.participant.findMany({
                    where: alreadyEnded
                        ? { quizId: quiz_id, finalRank: { not: null } }
                        : { quizId: quiz_id, isKicked: false },
                    orderBy: [{ totalScore: 'desc' }, { id: 'desc' }],
                });
                let rank = 1;
                let previousScore: number | undefined;
                const ranked = rankable.map((entry, index) => {
                    if (previousScore !== undefined && entry.totalScore < previousScore)
                        rank = index + 1;
                    previousScore = entry.totalScore;
                    return { ...entry, finalRank: alreadyEnded ? (entry.finalRank ?? rank) : rank };
                });
                if (!alreadyEnded) {
                    for (const entry of ranked) {
                        await tx.participant.update({
                            where: { id: entry.id },
                            data: { finalRank: entry.finalRank },
                        });
                    }
                }
                const topScores = ranked.slice(0, 10).map((entry) => ({
                    id: entry.id,
                    totalScore: entry.totalScore,
                    rank: entry.finalRank,
                    nickname: entry.nickname,
                    avatar: entry.avatar,
                }));
                const updatedSession = alreadyEnded
                    ? session
                    : await tx.gameSession.update({
                          where: { id: game_session_id },
                          data: {
                              hostScreen: HostScreen.QUIZ_RESULTS,
                              spectatorScreen: SpectatorScreen.QUIZ_RESULTS,
                              participantScreen: ParticipantScreen.QUIZ_RESULTS,
                              currentPhase: QuizPhase.QUIZ_RESULTS,
                              quizEndScreen: QuizEndScreen.ARE_YOU_UP,
                          },
                      });
                if (!alreadyEnded) {
                    await tx.quiz.update({
                        where: { id: quiz_id },
                        data: {
                            status: quiz.prizePool
                                ? QuizStatus.PAYOUT_PENDING
                                : QuizStatus.COMPLETED,
                        },
                    });
                    if (quiz.prizePool && quiz.prizePool > 0) {
                        await this.create_prize_claims(tx, quiz_id, ranked);
                    }
                }
                return {
                    updatedSession,
                    ranked,
                    status: alreadyEnded
                        ? quiz.status
                        : quiz.prizePool
                          ? QuizStatus.PAYOUT_PENDING
                          : QuizStatus.COMPLETED,
                    topScores,
                    totalParticipants: rankable.length,
                    hasPrizes: !!quiz.prizePool,
                };
            });
            await this.redis_cache.set_game_session(game_session_id, result.updatedSession);
            await this.redis_cache.set_quiz(game_session_id, { status: result.status });
            for (const entry of result.ranked) {
                await this.redis_cache.set_participant(game_session_id, entry.id, {
                    finalRank: entry.finalRank,
                    totalScore: entry.totalScore,
                });
            }
            await this.quizManager.publish_event_to_redis(game_session_id, {
                type: MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS,
                payload: {
                    topScores: result.topScores,
                    totalParticipants: result.totalParticipants,
                    rankers: result.topScores
                        .slice(0, 3)
                        .map((entry) => ({ ...entry, finalRank: entry.rank })),
                    participantScreen: ParticipantScreen.QUIZ_RESULTS,
                    currentPhase: QuizPhase.QUIZ_RESULTS,
                    hostScreen: HostScreen.QUIZ_RESULTS,
                    spectatorScreen: SpectatorScreen.QUIZ_RESULTS,
                    quizEndScreen: result.updatedSession.quizEndScreen,
                },
            });
            if (result.hasPrizes) {
                const totalClaims = await prisma.prizeClaim.count({ where: { quizId: quiz_id } });
                await this.quizManager.publish_event_to_redis(game_session_id, {
                    type: MESSAGE_TYPES.PRIZE_CLAIMS_READY,
                    payload: { quizId: quiz_id, totalClaims },
                });
            }
        } catch (error) {
            console.error('Failed to finalize quiz:', error);
            await this.quizManager.publish_event_to_redis(game_session_id, {
                type: MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS,
                payload: {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Failed to end quiz. Please try again.',
                },
                only_socket_id: ws.id,
            });
        }
    }

    private async handle_advance_quiz_end_screen(ws: GameWebSocket) {
        const { gameSessionId: game_session_id } = ws.user;
        await withGameSessionLock(game_session_id, async (tx) => {
            const session = await tx.gameSession.findUnique({ where: { id: game_session_id } });
            if (!session || session.currentPhase !== QuizPhase.QUIZ_RESULTS) return;
            const quizEndScreen =
                session.quizEndScreen === QuizEndScreen.ARE_YOU_UP
                    ? QuizEndScreen.READY_TO_ANNOUNCE
                    : session.quizEndScreen === QuizEndScreen.READY_TO_ANNOUNCE
                      ? QuizEndScreen.ANNOUNCED
                      : null;
            if (!quizEndScreen) return;
            const updatedSession = await tx.gameSession.update({
                where: { id: game_session_id },
                data: { quizEndScreen },
            });
            await this.redis_cache.set_game_session(game_session_id, updatedSession);
            await this.quizManager.publish_event_to_redis(game_session_id, {
                type: MESSAGE_TYPES.ADVANCE_QUIZ_END_SCREEN,
                payload: {
                    participantScreen: ParticipantScreen.QUIZ_RESULTS,
                    currentPhase: QuizPhase.QUIZ_RESULTS,
                    hostScreen: HostScreen.QUIZ_RESULTS,
                    spectatorScreen: SpectatorScreen.QUIZ_RESULTS,
                    quizEndScreen,
                },
            });
        });
    }

    private async handle_update_current_question(
        ws: GameWebSocket,
        payload: { questionId: string; questionIndex: number },
    ) {
        await withGameSessionLock(ws.user.gameSessionId, async (tx) => {
            const session = await tx.gameSession.findUnique({
                where: { id: ws.user.gameSessionId },
            });
            if (
                !session ||
                session.currentPhase === QuizPhase.QUESTION_ACTIVE ||
                session.currentPhase === QuizPhase.QUESTION_READING ||
                session.currentPhase === QuizPhase.QUIZ_RESULTS
            )
                return;
            const question = await tx.question.findFirst({
                where: {
                    id: payload.questionId,
                    quizId: ws.user.quizId,
                    orderIndex: payload.questionIndex,
                    isAsked: false,
                },
            });
            if (!question) return;
            const updatedSession = await tx.gameSession.update({
                where: { id: ws.user.gameSessionId },
                data: { currentQuestionId: question.id, currentQuestionIndex: question.orderIndex },
            });
            await this.redis_cache.set_game_session(ws.user.gameSessionId, updatedSession);
        });
    }

    private async validateHostInDB(quizId: string, hostId: string): Promise<boolean> {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId, hostId },
        });
        return !!quiz;
    }

    private async create_prize_claims(
        tx: Prisma.TransactionClient,
        quiz_id: string,
        rankable: { id: string; totalScore: number }[],
    ) {
        const distributions = await tx.prizeDistribution.findMany({
            where: { quizId: quiz_id },
            orderBy: { rank: 'asc' },
        });

        if (distributions.length === 0) return;

        const quiz = await tx.quiz.findUnique({
            where: { id: quiz_id },
            select: { prizePool: true, title: true },
        });

        if (!quiz || !quiz.prizePool) return;

        // Assign finalRanks to rankable (already done in handle_quiz_results)
        // Build rank-to-participants mapping with tie handling
        const rankMap = new Map<number, string[]>();
        let currentRank = 1;
        for (let i = 0; i < rankable.length; i++) {
            if (i > 0 && rankable[i]!.totalScore < rankable[i - 1]!.totalScore) {
                currentRank = i + 1;
            }
            const existing = rankMap.get(currentRank) || [];
            existing.push(rankable[i]!.id);
            rankMap.set(currentRank, existing);
        }

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const claimsToCreate: Array<{
            participantId: string;
            rank: number;
            amount: number;
            amountBaseUnits: bigint;
        }> = [];

        for (const dist of distributions) {
            const participantIds = rankMap.get(dist.rank);
            if (!participantIds || participantIds.length === 0) continue;

            if (participantIds.length === 1) {
                // Single winner at this rank
                claimsToCreate.push({
                    participantId: participantIds[0]!,
                    rank: dist.rank,
                    amount: dist.amount || (quiz.prizePool * dist.percentage) / 100,
                    amountBaseUnits:
                        dist.amountBaseUnits ||
                        BigInt(Math.floor(((quiz.prizePool * dist.percentage) / 100) * 1e6)),
                });
            } else {
                // Tied participants: split the prize for this rank among them
                // Also collect prizes from subsequent tied positions
                const tiedCount = participantIds.length;
                let totalAmountForTied = dist.amount || (quiz.prizePool * dist.percentage) / 100;

                // Add amounts from ranks that are "consumed" by the tie
                for (let r = 1; r < tiedCount; r++) {
                    const nextDist = distributions.find((d) => d.rank === dist.rank + r);
                    if (nextDist) {
                        totalAmountForTied +=
                            nextDist.amount || (quiz.prizePool * nextDist.percentage) / 100;
                    }
                }

                const splitAmount = totalAmountForTied / tiedCount;
                const splitBaseUnits = BigInt(Math.floor(splitAmount * 1e6));

                for (const pid of participantIds) {
                    claimsToCreate.push({
                        participantId: pid,
                        rank: dist.rank,
                        amount: splitAmount,
                        amountBaseUnits: splitBaseUnits,
                    });
                }
            }
        }

        // Create PrizeClaim records in the database
        for (const claim of claimsToCreate) {
            const participant = await tx.participant.findUnique({
                where: { id: claim.participantId },
                select: { email: true, nickname: true },
            });

            if (!participant) continue;

            const claimToken = crypto.randomBytes(16).toString('hex');
            const claimTokenHash = crypto.createHash('sha256').update(claimToken).digest('hex');
            const emailHash = crypto.createHash('sha256').update(participant.email).digest('hex');

            const existing = await tx.prizeClaim.findFirst({
                where: { quizId: quiz_id, participantId: claim.participantId },
            });
            if (existing) continue;

            await tx.prizeClaim.create({
                data: {
                    quizId: quiz_id,
                    participantId: claim.participantId,
                    rank: claim.rank,
                    amount: claim.amount,
                    amountBaseUnits: claim.amountBaseUnits,
                    claimToken,
                    claimTokenHash,
                    emailHash,
                    expiresAt,
                },
            });
        }
    }

    private generateSocketId(): string {
        return uuid();
    }
}
