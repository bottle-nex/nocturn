import Redis from 'ioredis';
import RedisCache from '../cache/redis.cache';
import { Participant, QuizStatus, SessionStatus, Spectator } from '@nocturn/database';
import { LiveGameTokenPayload, MESSAGE_TYPES, PubSubMessageTypes, SECONDS } from '@nocturn/types';
import { PhaseQueueJobDataType } from '../types/web-socket-types';
import { HostScreen, ParticipantScreen, QuizPhase, SpectatorScreen } from '@nocturn/database';
import DatabaseQueue from '../queue/database/database.queue';
import PhaseQueue from '../queue/PhaseQueue';
import { PublicKey } from 'jsonwebtoken';

export interface QuizManagerDependencies {
    publisher: Redis;
    subscriber: Redis;
    redis_cache: RedisCache;
    database_queue: DatabaseQueue;
}

export default class QuizManager {
    private publisher: Redis;
    private redis_cache: RedisCache;
    private database_queue: DatabaseQueue;
    private phase_queue!: PhaseQueue;

    constructor(dependencies: QuizManagerDependencies) {
        this.publisher = dependencies.publisher;
        this.redis_cache = dependencies.redis_cache;
        this.database_queue = dependencies.database_queue;
    }

    public set_phase_queue(phase_queue_instance: PhaseQueue) {
        this.phase_queue = phase_queue_instance;
    }

    public async onParticipantConnect(decoded_cookie_payload: LiveGameTokenPayload) {
        const particpant_id = decoded_cookie_payload.userId;
        const particicpant_cache = await this.redis_cache.get_participant(
            decoded_cookie_payload.gameSessionId,
            particpant_id,
        );
        if (!particicpant_cache) {
            return;
        }
        const participant: Partial<Participant> = {
            id: particicpant_cache.id,
            avatar: particicpant_cache.avatar,
            nickname: particicpant_cache.nickname,
        };
        const pub_sub_message: PubSubMessageTypes = {
            type: MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION,
            payload: participant,
        };
        this.publish_event_to_redis(decoded_cookie_payload.gameSessionId, pub_sub_message);
    }

    public async onSpectatorConnect(payload: LiveGameTokenPayload) {
        const spectator_id = payload.userId;

        const spectator_cache = await this.redis_cache.get_spectator(
            payload.gameSessionId,
            spectator_id,
        );

        const spectator: Partial<Spectator> = {
            id: spectator_cache.id,
            avatar: spectator_cache.avatar,
            nickname: spectator_cache.nickname,
        };

        const pub_sub_message: PubSubMessageTypes = {
            type: MESSAGE_TYPES.SPECTATOR_JOIN_GAME_SESSION,
            payload: spectator,
        };

        this.publish_event_to_redis(payload.gameSessionId, pub_sub_message);
    }

    public async publish_event_to_redis(session_id: string, event: PubSubMessageTypes) {
        try {
            const key = this.get_redis_key(session_id);
            await this.publisher.publish(key, JSON.stringify(event));
        } catch (err) {
            console.error('Error while publishing event to redis', err);
        }
    }

    public async publish_collab_event_to_redis(session_id: string, event: PubSubMessageTypes) {
        try {
            const key = this.get_collab_redis_key(session_id);
            await this.publisher.publish(key, JSON.stringify(event));
        } catch (err) {
            console.error('Error while publishing event to redis', err);
        }
    }

    private get_collab_redis_key(game_session_id: string) {
        return `collab_session:${game_session_id}`;
    }

    private get_redis_key(game_session_id: string) {
        return `game_session:${game_session_id}`;
    }

    public async handle_transition_phase(data: PhaseQueueJobDataType) {
        if (
            data.fromPhase === QuizPhase.QUESTION_READING &&
            data.toPhase === QuizPhase.QUESTION_ACTIVE
        ) {
            await this.handle_reading_to_active_transition_phase(data);
        } else if (
            data.fromPhase === QuizPhase.QUESTION_ACTIVE &&
            data.toPhase === QuizPhase.SHOW_RESULTS
        ) {
            await this.handle_active_to_results_transition_phase(data);
        }
    }

    private async handle_reading_to_active_transition_phase(data: PhaseQueueJobDataType) {
        const quiz = await this.redis_cache.get_quiz(data.gameSessionId);
        if (!quiz) {
            // send websocket message for error
            console.error('Quiz not found');
            return;
        }

        //clear the key here

        const question = quiz.questions?.find((q) => q.id === data.questionId);
        if (!question) {
            // send websocket message for error
            console.error(`Question with id: ${data.questionId} doesn't exist`);
            return;
        }

        const now = Date.now();
        const buffer = 2 * SECONDS;
        const question_active_time = question.timeLimit * SECONDS;

        const start_time = now + buffer;
        const end_time = start_time + question_active_time;

        this.database_queue
            .update_game_session(
                data.gameSessionId,
                {
                    hostScreen: HostScreen.QUESTION_ACTIVE,
                    spectatorScreen: SpectatorScreen.QUESTION_ACTIVE,
                    participantScreen: ParticipantScreen.QUESTION_ACTIVE,
                    currentPhase: QuizPhase.QUESTION_ACTIVE,
                    phaseStartTime: new Date(start_time),
                    phaseEndTime: new Date(end_time),
                },
                data.gameSessionId,
            )
            .catch((err) => {
                console.error('Failed to enqueue question active phase:', err);
            });

        const pub_sub_message_to_participant: PubSubMessageTypes = {
            type: MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_PARTICIPANT,
            payload: {
                questionOptions: question.options,
                participantScreen: ParticipantScreen.QUESTION_ACTIVE,
                startTime: start_time,
                endTime: end_time,
            },
        };
        this.publish_event_to_redis(data.gameSessionId, pub_sub_message_to_participant);

        const pub_sub_message_to_host: PubSubMessageTypes = {
            type: MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_HOST,
            payload: {
                questionOptions: question.options,
                hostScreen: HostScreen.QUESTION_ACTIVE,
                startTime: start_time,
                endTime: end_time,
            },
        };
        this.publish_event_to_redis(data.gameSessionId, pub_sub_message_to_host);

        const pub_sub_message_to_spectator: PubSubMessageTypes = {
            type: MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_SPECTATOR,
            payload: {
                questionOptions: question.options,
                spectatorScreen: SpectatorScreen.QUESTION_ACTIVE,
                startTime: start_time,
                endTime: end_time,
            },
        };
        this.publish_event_to_redis(data.gameSessionId, pub_sub_message_to_spectator);

        await this.phase_queue.schedule_phase_transition({
            gameSessionId: data.gameSessionId,
            questionId: data.questionId,
            questionIndex: data.questionIndex,
            fromPhase: QuizPhase.QUESTION_ACTIVE,
            toPhase: QuizPhase.SHOW_RESULTS,
            executeAt: end_time,
        });
    }

    private async handle_active_to_results_transition_phase(data: PhaseQueueJobDataType) {
        const quiz = await this.redis_cache.get_quiz(data.gameSessionId);

        if (!quiz) {
            console.error('Quiz not found');
            return;
        }

        await this.redis_cache.cleanup_all_lifeline_sessions(data.gameSessionId);

        const question = quiz.questions?.find((q) => q.id === data.questionId);

        if (!question) {
            console.error(`Question with id: ${data.questionId} doesn't exist`);
            return;
        }

        const now = Date.now();
        const buffer = 2 * SECONDS; // 2 seconds

        const start_time = now + buffer;

        this.database_queue
            .update_game_session(
                data.gameSessionId,
                {
                    hostScreen: HostScreen.QUESTION_RESULTS,
                    spectatorScreen: SpectatorScreen.QUESTION_RESULTS,
                    participantScreen: ParticipantScreen.QUESTION_RESULTS,
                    currentPhase: QuizPhase.SHOW_RESULTS,
                    phaseStartTime: new Date(start_time),
                    phaseEndTime: null, // will be controlled by host to choose to go to next question
                },
                data.gameSessionId,
            )
            .catch((err) => {
                console.error('Failed to enqueue show result phase:', err);
            });

        const score_of_all_participants = await this.redis_cache.get_all_participants(
            data.gameSessionId,
            ['totalScore', 'finalRank', 'longestStreak'],
        );

        const response_of_all_participants = await this.redis_cache.get_all_question_responses(
            data.gameSessionId,
            data.questionId,
            ['isCorrect', 'selectedAnswer', 'pointsEarned'],
        );

        const pub_sub_message_to_participant: PubSubMessageTypes = {
            type: MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_PARTICIPANT,
            payload: {
                scores: score_of_all_participants,
                responses: response_of_all_participants,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                participantScreen: ParticipantScreen.QUESTION_RESULTS,
                startTime: start_time,
            },
        };

        this.publish_event_to_redis(data.gameSessionId, pub_sub_message_to_participant);

        const pub_sub_message_to_host: PubSubMessageTypes = {
            type: MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_HOST,
            payload: {
                scores: score_of_all_participants,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                hostScreen: HostScreen.QUESTION_RESULTS,
                startTime: start_time,
            },
        };
        this.publish_event_to_redis(data.gameSessionId, pub_sub_message_to_host);

        const pub_sub_message_to_spectator: PubSubMessageTypes = {
            type: MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_SPECTATOR,
            payload: {
                scores: score_of_all_participants,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                spectatorScreen: SpectatorScreen.QUESTION_RESULTS,
                startTime: start_time,
            },
        };
        this.publish_event_to_redis(data.gameSessionId, pub_sub_message_to_spectator);
    }

    public async distribute_prize(
        game_session_id: string,
        quiz_id: string,
        _first: PublicKey,
        _second: PublicKey,
        _third: PublicKey,
    ) {
        // call the contract here with these pub-keys

        // after success
        this.database_queue.update_game_session(
            game_session_id,
            {
                status: SessionStatus.COMPLETED,
            },
            game_session_id,
        );

        this.database_queue.update_quiz(
            quiz_id,
            {
                status: QuizStatus.PAYOUT_COMPLETED,
                endedAt: new Date(),
            },
            game_session_id,
        );
    }
}
