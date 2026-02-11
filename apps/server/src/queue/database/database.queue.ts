import Bull from 'bull';
import { prisma, Prisma } from '@nocturn/database';
import RedisCache from '../../cache/redis.cache';
import { redisCacheInstance } from '../../services/init.services';
import { ReactorType } from '@nocturn/types';
import { env } from '../../configs/env';
import { Interactions } from '@nocturn/database';
import { DatabaseQueueProcessors } from './processor.database.queue';
import { JobOption, QueueJobTypes } from '../../types/database-queue-types';

const REDIS_URL = env.SERVER_REDIS_URL;

export default class DatabaseQueue {
    private database_queue: Bull.Queue;
    private redis_cache: RedisCache;
    private processors: DatabaseQueueProcessors;
    private default_job_options: JobOption = {
        attempts: 3,
        delay: 1000,
        removeOnFail: 5,
        removeOnComplete: 10,
    };

    constructor() {
        this.redis_cache = redisCacheInstance;
        this.database_queue = new Bull('database-operations', {
            redis: REDIS_URL,
        });
        this.processors = new DatabaseQueueProcessors(this.redis_cache);
        this.setupProcessors();
    }

    private setupProcessors() {
        this.database_queue.process(
            QueueJobTypes.UPDATE_GAME_SESSION,
            this.processors.update_game_session_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.UPDATE_QUIZ,
            this.processors.update_quiz_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.UPDATE_PARTICIPANT,
            this.processors.update_participant_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.UPDATE_SPECTATOR,
            this.processors.update_spectator_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.CREATE_CHAT_MESSAGE,
            this.processors.create_chat_message_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.CREATE_CHAT_REACTION,
            this.processors.create_chat_reaction_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.CREATE_PARTICIPANT_RESPONSE,
            this.processors.create_participant_response_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.CREATE_LIFELINE_USAGE,
            this.processors.create_lifeline_usage_processor.bind(this.processors),
        );
        this.database_queue.process(
            QueueJobTypes.UPDATE_QUESTION,
            this.processors.update_question_processor.bind(this.processors),
        );
    }

    public async update_game_session(
        id: string,
        gameSession: any,
        game_session_id: string,
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue.add(
            QueueJobTypes.UPDATE_GAME_SESSION,
            { id, gameSession, game_session_id },
            { ...this.default_job_options, ...options },
        );
    }

    public async update_quiz(
        id: string,
        quiz: Prisma.QuizUpdateInput,
        game_session_id: string,
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue.add(
            QueueJobTypes.UPDATE_QUIZ,
            { id, quiz, game_session_id },
            { ...this.default_job_options, ...options },
        );
    }

    public async update_participant(
        id: string,
        participant: Prisma.ParticipantUpdateInput,
        game_session_id: string,
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue.add(
            QueueJobTypes.UPDATE_PARTICIPANT,
            { id, participant, game_session_id },
            { ...this.default_job_options, ...options },
        );
    }

    public async update_spectator(
        id: string,
        spectator: Prisma.SpectatorUpdateInput,
        game_session_id: string,
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue.add(
            QueueJobTypes.UPDATE_SPECTATOR,
            { id, spectator, game_session_id },
            { ...this.default_job_options, ...options },
        );
    }

    public async create_chat_message(
        id: string,
        game_session_id: string,
        quiz_id: string,
        chatMessage: {
            senderId: string;
            senderRole: string;
            senderName: string;
            senderAvatar: string;
            message: string;
            repliedToId?: string | null;
        },
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue.add(
            QueueJobTypes.CREATE_CHAT_MESSAGE,
            { id, game_session_id, quiz_id, chatMessage },
            { ...this.default_job_options, ...options },
        );
    }

    public async create_chat_reaction(
        id: string,
        chat_message_id: string,
        chat_reaction: {
            reactedAt: Date;
            reaction: Interactions;
            reactorAvatar: string;
            reactorName: string;
            reactorType: ReactorType;
        },
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue
            .add(
                QueueJobTypes.CREATE_CHAT_REACTION,
                { id, chat_message_id, chat_reaction },
                { ...this.default_job_options, ...options },
            )
            .catch((err) => console.error('Failed to enqueue chat reaction:', err));
    }

    public async create_participant_response(
        id: string,
        game_session_id: string,
        response: {
            selectedAnswer: number;
            isCorrect: boolean;
            timeToAnswer: number;
            pointsEarned: number;
            timeBonus: number;
            streakBonus: number;
            answeredAt: Date;
            questionId: string;
        },
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue
            .add(
                QueueJobTypes.CREATE_PARTICIPANT_RESPONSE,
                { id, game_session_id, response },
                { ...this.default_job_options, ...options },
            )
            .catch((err) => console.error('Failed to enqueue participant response: ', err));
    }

    public async create_lifeline_usage(
        participant_id: string,
        game_session_id: string,
        options?: Partial<JobOption>,
    ) {
        return await this.database_queue
            .add(
                QueueJobTypes.CREATE_LIFELINE_USAGE,
                { participant_id, game_session_id },
                { ...this.default_job_options, ...options },
            )
            .catch((err) => console.error('Failed to enqueue lifeline response: ', err));
    }

    public async check_lifeline_usage(
        participantId: string,
        gameSessionId: string,
    ): Promise<boolean> {
        try {
            const usage = await prisma.lifelineUsage.findUnique({
                where: {
                    participantId_gameSessionId: {
                        participantId,
                        gameSessionId,
                    },
                },
            });
            return !!usage;
        } catch (error) {
            console.error('Error checking lifeline usage:', error);
            return false;
        }
    }

    public async update_question(
        game_session_id: string,
        question_id: string,
        question: Prisma.QuestionUpdateInput,
        options?: Partial<JobOption>,
    ) {
        try {
            return await this.database_queue.add(
                QueueJobTypes.UPDATE_QUESTION,
                { game_session_id, question_id, question },
                { ...this.default_job_options, ...options },
            );
        } catch (error) {
            console.error('Error in updating question queue: ', error);
            return;
        }
    }
}