import RedisCache from '../cache/redis.cache';
import { CustomWebSocket } from '../types/web-socket-types';
import DatabaseQueue from '../queue/DatabaseQueue';
import QuizManager from './QuizManager';
import { prisma } from '@nocturn/database';

export interface HostManagerDependencies {
    socketMapping: Map<string, CustomWebSocket>;
    sessionHostMapping: Map<string, string>;
    quizManager: QuizManager;
    databaseQueue: DatabaseQueue;
    redis_cache: RedisCache;
}

export default class CollaboratorsStateManager {
    private redis_cache: RedisCache;
    private collaborators_state: Map<string, any> = new Map<string, any>();

    constructor(dependencies: HostManagerDependencies) {
        this.redis_cache = dependencies.redis_cache;
    }

    public get_collaborators_state(session_id: string) {
        return this.collaborators_state.get(session_id);
    }

    public async on_collaborators_connect(session_id: string, quiz_id: string) {
        const quiz_state = this.get_quiz_state(quiz_id);
        if (!quiz_state) {
            return;
        }
        this.collaborators_state.set(session_id, {
            quiz_state,
        });
    }

    public async get_quiz_state(quiz_id: string) {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quiz_id,
            },
            include: {
                questions: true,
            },
        });
        if (!quiz) {
            return null;
        }
        return quiz;
    }
}
