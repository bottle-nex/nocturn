import Redis from 'ioredis';
import QuizManager from './QuizManager';
import {
    CookiePayload,
    CustomWebSocket,
    MESSAGE_TYPES,
    ParticipantNameChangeEvent,
    PubSubMessageTypes,
} from '../types/web-socket-types';
import prisma from '@repo/db/client';
import { v4 as uuid } from 'uuid';
import DatabaseQueue from '../queue/DatabaseQueue';
import RedisCache from '../cache/RedisCache';
import { QuizPhase } from '.prisma/client';

export interface ParticipantManagerDependencies {
    publisher: Redis;
    subscriber: Redis;
    socket_mapping: Map<string, CustomWebSocket>;
    session_participants_mapping: Map<string, Set<string>>;
    session_spectators_mapping: Map<string, Set<string>>;
    quizManager: QuizManager;
    databaseQueue: DatabaseQueue;
    redis_cache: RedisCache;
}

export default class ParticipantManager {
    private publisher: Redis;
    private subscriber: Redis;
    private session_participants_mapping: Map<string, Set<string>>;
    private session_spectators_mapping: Map<string, Set<string>>;
    private quizManager: QuizManager;
    private socket_mapping: Map<string, CustomWebSocket>;
    private database_queue: DatabaseQueue;
    private redis_cache: RedisCache;

    private participant_socket_mapping: Map<string, string> = new Map(); // Map<participantId, socketId>

    constructor(dependencies: ParticipantManagerDependencies) {
        this.publisher = dependencies.publisher;
        this.subscriber = dependencies.subscriber;
        this.socket_mapping = dependencies.socket_mapping;
        this.session_participants_mapping = dependencies.session_participants_mapping;
        this.session_spectators_mapping = dependencies.session_spectators_mapping;
        this.quizManager = dependencies.quizManager;
        this.database_queue = dependencies.databaseQueue;
        this.redis_cache = dependencies.redis_cache;
    }

    public async handle_connection(ws: CustomWebSocket, decoded_cookie_payload: CookiePayload) {
        const is_valid_participant = await this.validate_participant_in_db(
            decoded_cookie_payload.quizId,
            decoded_cookie_payload.userId,
        );
        if (!is_valid_participant) {
            ws.close();
            return;
        }

        this.cleanup_existing_partiicpant_socket(
            decoded_cookie_payload.userId,
            decoded_cookie_payload.gameSessionId,
        );

        const new_participant_socket_id = this.generateSocketId();

        ws.id = new_participant_socket_id;
        ws.user = decoded_cookie_payload;

        const hasUsedLifeline = await this.database_queue.check_lifeline_usage(
            decoded_cookie_payload.userId,
            decoded_cookie_payload.gameSessionId,
        );

        if (hasUsedLifeline) {
            await this.redis_cache.cache_participant_lifeline_used(
                decoded_cookie_payload.gameSessionId,
                decoded_cookie_payload.userId,
            );
        }

        const initialStatus = {
            type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
            payload: { hasUsedLifeline },
        };
        ws.send(JSON.stringify(initialStatus));

        this.socket_mapping.set(new_participant_socket_id, ws);
        this.participant_socket_mapping.set(
            decoded_cookie_payload.userId,
            new_participant_socket_id,
        );

        const session_participants_socket_ids = this.session_participants_mapping.get(
            decoded_cookie_payload.gameSessionId,
        );

        if (!session_participants_socket_ids) {
            this.session_participants_mapping.set(decoded_cookie_payload.gameSessionId, new Set());
        }

        this.session_participants_mapping
            .get(decoded_cookie_payload.gameSessionId)
            ?.add(new_participant_socket_id);
        this.setup_message_handlers(ws);

        this.quizManager.onParticipantConnect(decoded_cookie_payload);
    }

    private setup_message_handlers(ws: CustomWebSocket) {
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handle_participant_message(ws, message);
            } catch (err) {
                console.error('Error parsing message', err);
            }
        });

        ws.on('close', () => {
            this.handle_participant_leave_gamesession(ws);
            this.cleanup_participant_socket(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.cleanup_participant_socket(ws);
        });
    }

    private handle_participant_message(ws: CustomWebSocket, message: any) {
        const { type, payload } = message;
        switch (type) {
            case MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE:
                this.handle_participant_name_change(payload, ws);
                break;

            case MESSAGE_TYPES.INTERACTION_EVENT:
                this.handle_incoming_interaction_event(payload, ws);
                break;

            case MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE:
                this.handle_participant_response(payload, ws);
                break;

            case MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION:
                this.handle_participant_leave_gamesession(ws);
                break;
            case MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE:
                this.handle_participant_request_lifeline(payload, ws);
                break;

            default:
                console.error('Unknown message type at participant manager', type);
                break;
        }
    }

    private async handle_participant_request_lifeline(payload: any, ws: CustomWebSocket) {
        const { gameSessionId, userId } = ws.user;
        const { questionId } = payload;

        // if question is in active phase
        const gameSession = await this.redis_cache.get_game_session(gameSessionId);
        if (!gameSession || gameSession.currentPhase !== QuizPhase.QUESTION_ACTIVE) {
            const error_message = {
                type: MESSAGE_TYPES.LIFELINE_TIMEOUT,
                payload: { error: 'Lifeline cannot be used now' },
            };
            ws.send(JSON.stringify(error_message));
            return;
        }

        // if participant has already used lifeline
        let hasUsedLifeline = await this.redis_cache.get_cached_lifeline_usage(
            gameSessionId,
            userId,
        );

        if (hasUsedLifeline == null) {
            hasUsedLifeline = await this.database_queue.check_lifeline_usage(userId, gameSessionId);
            if (hasUsedLifeline) {
                await this.redis_cache.cache_participant_lifeline_used(gameSessionId, userId);
            }
        }

        if (hasUsedLifeline) {
            const error_message = {
                type: MESSAGE_TYPES.LIFELINE_TIMEOUT,
                payload: { error: 'Lifeline already used' },
            };
            ws.send(JSON.stringify(error_message));
            return;
        }

        // if spectators are available
        const spectatorSocketIds = this.session_spectators_mapping.get(gameSessionId);
        if (!spectatorSocketIds || spectatorSocketIds.size === 0) {
            const error_message = {
                type: MESSAGE_TYPES.LIFELINE_TIMEOUT,
                payload: { error: 'No spectators available to help' },
            };
            ws.send(JSON.stringify(error_message));
            return;
        }

        await this.redis_cache.cache_participant_lifeline_used(gameSessionId, userId);

        this.database_queue.create_lifeline_usage(userId, gameSessionId).catch((err) => {
            console.error('Failed to record lifeline usage:', err);
        });

        const lifelineSession = await this.redis_cache.get_active_lifeline_session(
            gameSessionId,
            questionId,
        );

        if (!lifelineSession) {
            const expiresAt = Date.now() + 15 * 1000; // 15 seconds from now
            await this.redis_cache.set_active_lifeline_session(
                gameSessionId,
                questionId,
                [userId],
                expiresAt,
            );

            const pub_sub_message: PubSubMessageTypes = {
                type: MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION,
                payload: {
                    questionId,
                    expiresAt,
                    participantCount: 1,
                },
            };
            this.quizManager.publish_event_to_redis(gameSessionId, pub_sub_message);

            setTimeout(() => {
                this.process_lifeline_results(gameSessionId, questionId);
            }, 15000);
        } else {
            if (!lifelineSession.participants.includes(userId)) {
                lifelineSession.participants.push(userId);
                await this.redis_cache.set_active_lifeline_session(
                    gameSessionId,
                    questionId,
                    lifelineSession.participants,
                    lifelineSession.expires_at,
                );

                const pub_sub_message: PubSubMessageTypes = {
                    type: MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION,
                    payload: {
                        questionId,
                        expiresAt: lifelineSession.expires_at,
                        participantCount: lifelineSession.participants.length,
                    },
                };
                this.quizManager.publish_event_to_redis(gameSessionId, pub_sub_message);
            }
        }

        const confirmation = {
            type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
            payload: {
                status: 'requested',
                expiresAt: lifelineSession?.expires_at || Date.now() + 15000,
            },
        };
        ws.send(JSON.stringify(confirmation));
    }

    private async process_lifeline_results(gameSessionId: string, questionId: string) {
        const lifelineSession = await this.redis_cache.get_active_lifeline_session(
            gameSessionId,
            questionId,
        );

        if (!lifelineSession) return;

        const responses = lifelineSession.responses;
        const optionCounts: { [key: number]: number } = {};

        Object.values(responses).forEach((option: any) => {
            optionCounts[option] = (optionCounts[option] || 0) + 1;
        });

        let mostPopularOption: any = null;
        let maxCount = 0;

        Object.entries(optionCounts).forEach(([option, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostPopularOption = parseInt(option);
            }
        });

        const maxCountEntries = Object.entries(optionCounts).filter(
            ([, count]) => count === maxCount,
        );
        if (maxCountEntries.length > 1 && maxCount > 0) {
            mostPopularOption = null;
        }

        for (const participantId of lifelineSession.participants) {
            const socketId = this.participant_socket_mapping.get(participantId);
            if (socketId) {
                const socket = this.socket_mapping.get(socketId);
                if (socket && socket.readyState === 1) {
                    // WebSocket.OPEN = 1
                    const resultMessage = {
                        type: MESSAGE_TYPES.LIFELINE_RESULT_TO_PARTICIPANT,
                        payload: {
                            mostPopularOption,
                            totalResponses: Object.keys(responses).length,
                            questionId,
                            optionBreakdown: optionCounts,
                            wasSuccessful: mostPopularOption !== null,
                        },
                    };

                    socket.send(JSON.stringify(resultMessage));
                }
            }
        }

        await this.redis_cache.delete_active_lifeline_session(gameSessionId, questionId);
    }

    private handle_incoming_interaction_event(payload: any, ws: CustomWebSocket) {
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

    private async handle_participant_name_change(
        payload: ParticipantNameChangeEvent,
        ws: CustomWebSocket,
    ) {
        const { gameSessionId: game_session_id } = ws.user;
        const { choosenNickname } = payload;
        const participant = await this.redis_cache.get_participant(game_session_id, ws.user.userId);
        if (participant?.isNameChanged) {
            return;
        }

        const { data } = await this.database_queue.update_participant(
            ws.user.userId,
            { nickname: choosenNickname, isNameChanged: true },
            game_session_id,
        );

        const event_data: PubSubMessageTypes = {
            type: MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE,
            payload: {
                id: ws.user.userId,
                nickname: data.participant.nickname,
                isNameChanged: data.participant.isNameChanged,
            },
        };
        this.quizManager.publish_event_to_redis(game_session_id, event_data);
    }

    private async handle_participant_response(payload: any, ws: CustomWebSocket) {
        const { userId: participant_id, gameSessionId: game_session_id } = ws.user;

        const { selectedAnswer } = payload;

        if (typeof selectedAnswer !== 'number') {
            console.error('Invalid type of selected answer');
            return;
        }

        const game_session = await this.redis_cache.get_game_session(game_session_id);

        if (!game_session) {
            console.error('Game session not found');
            return;
        }

        if (game_session.currentPhase !== QuizPhase.QUESTION_ACTIVE) {
            console.error('quiz is not in active phase');
            return;
        }

        const old_response = await this.redis_cache.get_participant_response(
            game_session_id,
            game_session.currentQuestionId!,
            participant_id,
        );

        if (old_response) {
            const event_data: PubSubMessageTypes = {
                type: MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE,
                payload: {
                    error: 'Already opted an option.',
                },
                only_socket_id: ws.id,
            };
            this.quizManager.publish_event_to_redis(game_session_id, event_data);
            return;
        }

        const quiz = await this.redis_cache.get_quiz(game_session_id);
        const participant = await this.redis_cache.get_participant(game_session_id, participant_id);

        if (!quiz) {
            console.error('Quiz not found');
            return;
        }

        const question = quiz.questions?.find((q) => q.id === game_session.currentQuestionId);

        if (!question) {
            console.error(`Question with id: ${game_session.currentQuestionId} doesn't exist`);
            return;
        }

        const answeredAt = Date.now();
        const question_active_time = Number(game_session.phaseStartTime!);

        const isCorrectAnswer = selectedAnswer === question.correctAnswer;

        this.database_queue.create_participant_response(participant_id, game_session_id, {
            selectedAnswer: selectedAnswer,
            isCorrect: isCorrectAnswer,
            timeToAnswer: question_active_time - answeredAt,
            pointsEarned: isCorrectAnswer ? question.basePoints : 0,
            timeBonus: 0,
            streakBonus: 0,
            answeredAt: new Date(answeredAt),
            questionId: game_session.currentQuestionId!,
        });

        this.database_queue.update_participant(
            participant_id,
            {
                totalScore: isCorrectAnswer
                    ? participant.totalScore + question.basePoints
                    : participant.totalScore,
                longestStreak: isCorrectAnswer
                    ? participant.longestStreak
                        ? participant.longestStreak + 1
                        : 1
                    : 0,
            },
            game_session_id,
        );

        const event_data: PubSubMessageTypes = {
            type: MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE,
            payload: {
                selectedAnswer: selectedAnswer,
            },
        };
        this.quizManager.publish_event_to_redis(game_session_id, event_data);
    }

    private async handle_participant_leave_gamesession(ws: CustomWebSocket) {
        const { gameSessionId: game_session_id } = ws.user;
        const user_id = ws.user.userId;

        const participant_cache = await this.redis_cache.get_participant(game_session_id, user_id);

        if (!participant_cache) {
            return;
        }

        const event_data: PubSubMessageTypes = {
            type: MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION,
            payload: {
                userId: user_id,
            },
            exclude_socket_id: ws.id,
        };
        this.quizManager.publish_event_to_redis(game_session_id, event_data);

        // delete the user from the database
        // either do this or add another schema for showing this user was removed
        // this.database_queue.delete_participant(user_id, game_session_id);
    }

    private cleanup_existing_partiicpant_socket(
        participant_id: string,
        game_session_id: string,
    ): void {
        const existing_participant_socket_id = this.participant_socket_mapping.get(participant_id);
        if (existing_participant_socket_id) {
            const existing_socket = this.socket_mapping.get(existing_participant_socket_id);
            if (existing_socket) existing_socket.close();
            this.socket_mapping.delete(existing_participant_socket_id);
            this.participant_socket_mapping.delete(participant_id);
            const session_participants_socket_ids =
                this.session_participants_mapping.get(game_session_id);
            if (session_participants_socket_ids) {
                session_participants_socket_ids.delete(existing_participant_socket_id);
            }
        }
    }

    private cleanup_participant_socket(ws: CustomWebSocket): void {
        if (!ws.id || !ws.user) {
            return;
        }

        const socket_id = ws.id;
        const participant_id = ws.user.userId;
        const game_session_id = ws.user.gameSessionId;

        this.socket_mapping.delete(socket_id);
        this.participant_socket_mapping.delete(participant_id);
        const session_participants_socket_ids =
            this.session_participants_mapping.get(game_session_id);
        if (session_participants_socket_ids) {
            session_participants_socket_ids.delete(socket_id);
            if (session_participants_socket_ids.size === 0) {
                this.session_participants_mapping.delete(game_session_id);
            }
        }
    }

    private async validate_participant_in_db(
        quizId: string,
        participantId: string,
    ): Promise<boolean> {
        const participant = await prisma.participant.findUnique({
            where: {
                id: participantId,
                quizId: quizId,
            },
        });
        return !!participant;
    }

    private generateSocketId(): string {
        return uuid();
    }
}
