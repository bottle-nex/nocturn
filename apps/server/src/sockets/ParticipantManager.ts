import Redis from 'ioredis';
import QuizManager from './QuizManager';
import {
    LiveGameTokenPayload,
    MESSAGE_TYPES,
    ParticipantNameChangeEvent,
    PubSubMessageTypes,
} from '@nocturn/types';
import { CustomWebSocket } from '../types/web-socket-types';
import { v4 as uuid } from 'uuid';
import DatabaseQueue from '../queue/database/database.queue';
import RedisCache from '../cache/redis.cache';
import { prisma, QuizPhase } from '@nocturn/database';
import WebSocket from 'ws';
import { socket_codes } from '@nocturn/types';
import QuizSettings from '../class/quizSettings';
import { quizSettingInstance } from '../services/init.services';

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
    private quiz_settings: QuizSettings;
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
        this.quiz_settings = quizSettingInstance;
    }

    public async handle_connection(
        ws: CustomWebSocket,
        decoded_cookie_payload: LiveGameTokenPayload,
    ) {
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
        if (!this.quiz_settings.quiz_settings_mapping.get(decoded_cookie_payload.gameSessionId)) {
            await this.quiz_settings.seed_settings_for_session(
                decoded_cookie_payload.gameSessionId,
            );
        }
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
            // this.handle_participant_leave_gamesession(ws);
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

            case MESSAGE_TYPES.PARTICIPANT_WARNING_COUNT:
                this.handle_participant_warning_count(ws);
                break;

            default:
                console.error('Unknown message type at participant manager', type);
                break;
        }
    }

    private async handle_participant_request_lifeline(payload: any, ws: CustomWebSocket) {
        const { gameSessionId, userId } = ws.user;
        const { questionId } = payload;

        const gameSession = await this.redis_cache.get_game_session(gameSessionId);
        if (!gameSession || gameSession.currentPhase !== QuizPhase.QUESTION_ACTIVE) {
            const error_message = {
                type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                payload: {
                    error: 'Lifeline can only be used during active questions',
                },
            };
            ws.send(JSON.stringify(error_message));
            return;
        }

        let hasUsedLifeline = await this.redis_cache.get_cached_lifeline_usage(
            gameSessionId,
            userId,
        );
        if (hasUsedLifeline === null) {
            hasUsedLifeline = await this.database_queue.check_lifeline_usage(userId, gameSessionId);
            if (hasUsedLifeline) {
                await this.redis_cache.cache_participant_lifeline_used(gameSessionId, userId);
            }
        }

        if (hasUsedLifeline) {
            const error_message = {
                type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                payload: { hasUsedLifeline: true, error: 'Lifeline already used' },
            };
            ws.send(JSON.stringify(error_message));
            return;
        }

        const alreadyRequested = await this.redis_cache.has_participant_requested_lifeline(
            gameSessionId,
            questionId,
            userId,
        );

        if (alreadyRequested) {
            const currentSession = await this.redis_cache.get_active_lifeline_session(
                gameSessionId,
                questionId,
            );
            if (currentSession) {
                const confirmation = {
                    type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                    payload: {
                        status: 'already_requested',
                        expiresAt: currentSession.expiresAt,
                        currentResponses: this.format_lifeline_responses_for_frontend(
                            currentSession.responses,
                        ),
                    },
                };
                ws.send(JSON.stringify(confirmation));
            }
            return;
        }

        const spectatorSocketIds = this.session_spectators_mapping.get(gameSessionId);
        if (!spectatorSocketIds || spectatorSocketIds.size === 0) {
            const error_message = {
                type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                payload: { error: 'No spectators available' },
            };
            ws.send(JSON.stringify(error_message));
            return;
        }

        await this.redis_cache.cache_participant_lifeline_used(gameSessionId, userId);
        this.database_queue.create_lifeline_usage(userId, gameSessionId).catch(console.error);

        const expirySeconds = 60;
        const existingSession = await this.redis_cache.get_active_lifeline_session(
            gameSessionId,
            questionId,
        );

        if (existingSession) {
            const success = await this.redis_cache.set_active_lifeline_session(
                gameSessionId,
                questionId,
                userId,
                expirySeconds,
            );

            if (!success) {
                const error_message = {
                    type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                    payload: { error: 'Failed to join lifeline session' },
                };
                ws.send(JSON.stringify(error_message));
                return;
            }

            // send current voting state to this participant
            const confirmation = {
                type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                payload: {
                    status: 'joined_existing',
                    expiresAt: existingSession.expiresAt,
                    currentResponses: this.format_lifeline_responses_for_frontend(
                        existingSession.responses,
                    ),
                    hasUsedLifeline: true,
                },
            };
            ws.send(JSON.stringify(confirmation));
        } else {
            const success = await this.redis_cache.set_active_lifeline_session(
                gameSessionId,
                questionId,
                userId,
                expirySeconds,
            );

            if (!success) {
                const error_message = {
                    type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                    payload: { error: 'Failed to create lifeline session' },
                };
                ws.send(JSON.stringify(error_message));
                return;
            }

            const invitation_message: PubSubMessageTypes = {
                type: MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION,
                payload: {
                    questionId,
                    status: 'active',
                    expiresAt: Date.now() + expirySeconds * 1000,
                },
            };
            this.quizManager.publish_event_to_redis(gameSessionId, invitation_message);

            const confirmation = {
                type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                payload: {
                    status: 'requested',
                    expiresAt: Date.now() + expirySeconds * 1000,
                    currentResponses: { 0: 0, 1: 0, 2: 0, 3: 0 },
                    hasUsedLifeline: true,
                },
            };
            ws.send(JSON.stringify(confirmation));
            // sending to only requesting participants
            await this.send_lifeline_results_to_all_requesting_participants(
                gameSessionId,
                questionId,
            );
        }
    }

    private format_lifeline_responses_for_frontend(
        responses: Record<string, number>,
    ): Record<number, number> {
        const counts: any = { 0: 0, 1: 0, 2: 0, 3: 0 };
        Object.values(responses).forEach((option) => {
            if (option >= 0 && option <= 3) {
                counts[option]++;
            }
        });
        return counts;
    }

    private async send_lifeline_results_to_all_requesting_participants(
        gameSessionId: string,
        questionId: string,
    ): Promise<void> {
        try {
            const session = await this.redis_cache.get_active_lifeline_session(
                gameSessionId,
                questionId,
            );
            if (!session) {
                console.error('No lifeline session found');
                return;
            }

            const results = await this.redis_cache.get_lifeline_results(gameSessionId, questionId);
            if (!results) {
                console.error('No lifeline results found');
                return;
            }

            // Send results to each requesting participant
            for (const participantId of session.requestingParticipants) {
                const socketId = this.participant_socket_mapping.get(participantId);
                if (socketId) {
                    const result_message = {
                        type: MESSAGE_TYPES.LIFELINE_RESULT_TO_PARTICIPANT,
                        payload: {
                            questionId,
                            mostPopularOption: results.mostPopularOption,
                            totalResponses: results.totalResponses,
                            wasSuccessful: results.wasSuccessful,
                            optionBreakdown: results.optionCounts,
                        },
                    };

                    const socket = this.socket_mapping.get(socketId);
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify(result_message));
                    }
                }
            }

            await this.redis_cache.delete_active_lifeline_session(gameSessionId, questionId);
        } catch (error) {
            console.error('Error sending lifeline results:', error);
        }
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
        if (!quiz || !participant) {
            console.error('Quiz or participant not found');
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

    private async handle_participant_warning_count(ws: CustomWebSocket) {
        const { gameSessionId: game_session_id } = ws.user;
        const { userId: participant_id } = ws.user;
        const participants_key = this.redis_cache.get_participants_key(game_session_id);
        // const participant = await this.redis_cache.get_participant(game_session_id, participant_id);

        try {
            const new_warning_count = await this.redis_cache.redis_cache.hincrby(
                participants_key,
                `${participant_id}:warningCount`,
                1,
            );

            if (new_warning_count >= 5) {
                const event_data: PubSubMessageTypes = {
                    type: MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION,
                    payload: { userId: participant_id },
                };
                this.quizManager.publish_event_to_redis(game_session_id, event_data);

                await this.database_queue.update_participant(
                    participant_id,
                    { isKicked: true },
                    game_session_id,
                );
                return;
            }

            await this.database_queue.update_participant(
                participant_id,
                { warningCount: new_warning_count },
                game_session_id,
            );
        } catch (err) {
            console.error('Error while updating participant warning count', err);
        }
    }

    private cleanup_existing_partiicpant_socket(
        participant_id: string,
        game_session_id: string,
    ): void {
        const existing_participant_socket_id = this.participant_socket_mapping.get(participant_id);
        if (existing_participant_socket_id) {
            const existing_socket = this.socket_mapping.get(existing_participant_socket_id);
            if (existing_socket && existing_socket.readyState === WebSocket.OPEN) {
                existing_socket.close(
                    socket_codes.DUPLICATE_CONNECTION,
                    'Another participant has connected',
                );
            }
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

    public get_participant_socket_mapping(): Map<string, string> {
        return this.participant_socket_mapping;
    }
}
