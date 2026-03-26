import RedisCache from '../cache/redis.cache';
import { prisma } from '@nocturn/database';
import { collabStateCacheInstance } from '../services/init.services';
import CollabStateCache from '../cache/collab_state.cache';

export interface CollaboratorsStateManagerDependencies {
    redis_cache: RedisCache;
}

export default class CollaboratorsStateManager {
    private redis_cache: RedisCache;
    private collaborator_quiz_state_cache: CollabStateCache = collabStateCacheInstance;

    constructor(dependencies: CollaboratorsStateManagerDependencies) {
        this.redis_cache = dependencies.redis_cache;
    }

    public async on_collaborators_connect(session_id: string, quiz_id: string) {
        await this.populate_state_from_db_to_redis(session_id, quiz_id);
    }

    public async populate_state_from_db_to_redis(collab_session_id: string, quiz_id: string) {
        const quiz = await this.get_quiz_state(quiz_id);
        if (!quiz) {
            return;
        }
        this.collaborator_quiz_state_cache.set_quiz_and_questions_state(
            collab_session_id,
            quiz_id,
            quiz,
        );
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
