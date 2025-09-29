import Redis from 'ioredis';
import {
    CookiePayload,
    CustomWebSocket,
    IncomingChatMessage,
    IncomingChatReaction,
    MESSAGE_TYPES,
    PubSubMessageTypes,
    SECONDS,
    USER_TYPE,
} from '../types/web-socket-types';
import QuizManager from './QuizManager';
import prisma, { HostScreen, ParticipantScreen, SpectatorScreen } from '@repo/db/client';
import { v4 as uuid } from 'uuid';
import { WebSocket } from 'ws';
import DatabaseQueue from '../queue/DatabaseQueue';
import RedisCache from '../cache/RedisCache';
import PhaseQueue from '../queue/PhaseQueue';
import { QuizPhase } from '.prisma/client';
import QuizSettings from '../class/quizSettings';
import { quizSettingInstance } from '../services/init-services';

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

    public async handle_connection(ws: CustomWebSocket, payload: CookiePayload): Promise<void> {
        const isValidHost = await this.validateHostInDB(payload.quizId, payload.userId);
        if (!isValidHost) {
            ws.close();
            return;
        }

        const existing_host_socket_id = this.sessionHostMapping.get(payload.gameSessionId);
        if (existing_host_socket_id) {
            const host_existing_socket = this.socketMapping.get(existing_host_socket_id);
            if (host_existing_socket && host_existing_socket.readyState === WebSocket.OPEN) {
                host_existing_socket.close();
            }
        }

        ws.user = payload;
        ws.id = this.generateSocketId();
        this.socketMapping.set(ws.id, ws);
        this.sessionHostMapping.set(payload.gameSessionId, ws.id);
        this.quizManager.onHostconnect(payload.gameSessionId, payload.quizId, ws.id);
        this.setup_message_handlers(ws);
    }

    private setup_message_handlers(ws: CustomWebSocket) {
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handle_host_message(ws, message);
            } catch (err) {
                console.error('Error parsing message', err);
            }
        });
    }

    private handle_host_message(ws: CustomWebSocket, message: any) {
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

            default:
                console.error('Unknown message type', type);
                break;
        }
    }

    private async handle_host_emits_hint(payload: any, ws: CustomWebSocket) {
        const { questionId: question_id } = payload;
        if (ws.user.role !== USER_TYPE.HOST) {
            return;
        }
        const quiz = await this.redis_cache.get_quiz(ws.user.gameSessionId);
        const question = quiz?.questions?.find((q) => q.id === question_id);
        if (!question || !question.hint) {
            return;
        }

        const hint = question.hint;
        const hintPayload: PubSubMessageTypes = {
            type: MESSAGE_TYPES.HOST_EMITS_HINT,
            payload: {
                hint,
            },
        };
        this.quizManager.publish_event_to_redis(ws.user.gameSessionId, hintPayload);
    }

    private handle_settings_change(ws: CustomWebSocket, payload: any): void {
        this.quiz_settings.update_quiz_settings_on_db_and_cache(
            ws.user.gameSessionId,
            ws.user.quizId,
            payload,
        );
    }

    private handle_incoming_interaction_event(payload: any, ws: CustomWebSocket): void {
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

    private async handle_question_launch(payload: any, ws: CustomWebSocket) {
        const { questionId, questionIndex } = payload;

        const { gameSessionId: game_session_id } = ws.user;
        const quiz = await this.redis_cache.get_quiz(game_session_id);

        if (!quiz) {
            throw new Error("Quiz doesn't exist in game_session");
        }

        const question = quiz.questions?.find((q) => q && q.orderIndex === questionIndex);

        //check this line proeprly
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
            this.quizManager.publish_event_to_redis(game_session_id, pub_sub_message_to_host);
            return;
        }

        const now = Date.now();
        const buffer = 2 * SECONDS;
        const question_reading_time = question.readingTime * SECONDS;

        const start_time = now + buffer;
        const end_time = start_time + question_reading_time;

        this.database_queue.update_game_session(
            game_session_id,
            {
                currentQuestionIndex: questionIndex,
                currentQuestionId: questionId,
                hostScreen: HostScreen.QUESTION_READING,
                spectatorScreen: SpectatorScreen.QUESTION_READING,
                participantScreen: ParticipantScreen.QUESTION_READING,
                phaseStartTime: new Date(start_time),
                phaseEndTime: new Date(end_time),
                currentPhase: QuizPhase.QUESTION_READING,
            },
            game_session_id,
        );

        this.database_queue.update_quiz(
            quiz.id!,
            {
                questions: {
                    update: {
                        where: { id: questionId },
                        data: { isAsked: true },
                    },
                },
            },
            game_session_id,
        );

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
        this.quizManager.publish_event_to_redis(game_session_id, pub_sub_message_to_participant);

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
        this.quizManager.publish_event_to_redis(game_session_id, pub_sub_message_to_host);

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
        this.quizManager.publish_event_to_redis(game_session_id, pub_sub_message_to_spectator);

        await this.phase_queue.schedule_phase_transition({
            gameSessionId: game_session_id,
            questionId,
            questionIndex,
            fromPhase: QuizPhase.QUESTION_READING,
            toPhase: QuizPhase.QUESTION_ACTIVE,
            executeAt: end_time,
        });
    }

    private async validateHostInDB(quizId: string, hostId: string): Promise<boolean> {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId, hostId },
        });
        return !!quiz;
    }

    private async handle_host_question_preview_page_change(ws: CustomWebSocket) {
        const { gameSessionId: game_session_id } = ws.user;
        const gameSession = await this.redis_cache.get_game_session(game_session_id);

        if (gameSession?.hostScreen === HostScreen.QUESTION_PREVIEW) {
            return;
        }

        this.database_queue.update_game_session(
            ws.user.userId,
            {
                hostScreen: HostScreen.QUESTION_PREVIEW,
                spectatorScreen: SpectatorScreen.QUESTION_MOTIVATION,
                participantScreen: ParticipantScreen.QUESTION_MOTIVATION,
            },
            game_session_id,
        );

        const event_data: PubSubMessageTypes = {
            type: MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW,
            payload: {
                id: ws.user.userId,
                screen: ParticipantScreen.QUESTION_MOTIVATION, // this will same for both paritcipant and spectator
            },
        };

        this.quizManager.publish_event_to_redis(game_session_id, event_data);
    }

    private async handle_send_chat_message(payload: IncomingChatMessage, ws: CustomWebSocket) {
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
            senderRole: sender_role,
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
            exclude_socket_id: ws.user.userId,
        };

        this.quizManager.publish_event_to_redis(gameSessionId, event_data);

        this.database_queue
            .create_chat_message(gameSessionId, gameSessionId, quizId, chatMessage)
            .catch((err) => {
                console.error('Failed to enqueue chat message:', err);
            });
    }

    private handle_incoming_chat_reaction_event(
        payload: IncomingChatReaction,
        ws: CustomWebSocket,
    ) {
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

    private generateSocketId(): string {
        return uuid();
    }
}
