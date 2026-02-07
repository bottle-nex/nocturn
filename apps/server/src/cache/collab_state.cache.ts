import Redis from 'ioredis';
import { env } from '../configs/env';
import { QuestionType } from '@nocturn/types';

export default class CollabStateCache {
    private collab_state_cache: Redis;

    constructor() {
        this.collab_state_cache = new Redis(env.SERVER_REDIS_URL);
    }

    public async set_quiz_and_questions_state(
        collab_session_id: string,
        quiz_id: string,
        quiz_state: any,
    ) {
        const questions = quiz_state.questions;
        delete quiz_state.questions;

        try {
            const quiz_pipeline = this.collab_state_cache.pipeline();
            const quiz_hash_key = this.get_session_to_quiz_key(collab_session_id, quiz_id);

            Object.entries(quiz_state).forEach(([key, value]) => {
                quiz_pipeline.hset(quiz_hash_key, key, JSON.stringify(value));
            });
            quiz_pipeline.expire(quiz_hash_key, 60 * 60 * 24);
            await quiz_pipeline.exec();

            if (!questions || questions.length === 0) {
                return;
            }

            const question_pipeline = this.collab_state_cache.pipeline();

            questions.forEach((question: any) => {
                const question_id = question.id;
                if (!question_id) return;

                const question_hash_key = this.get_session_to_question_key(
                    collab_session_id,
                    quiz_id,
                    question_id,
                );

                Object.entries(question).forEach(([field_name, field_value]) => {
                    question_pipeline.hset(
                        question_hash_key,
                        field_name,
                        JSON.stringify(field_value),
                    );
                });

                question_pipeline.expire(question_hash_key, 60 * 60 * 24);
            });

            await question_pipeline.exec();
        } catch (err) {
            console.error('Error setting quiz and questions state in Redis:', err);
        }
    }

    public async update_question_state(
        collab_session_id: string,
        quiz_id: string,
        question_state: any,
    ) {
        const question_id = question_state.id;
        if (!question_id) {
            throw new Error('Question ID is required for update');
        }

        try {
            const question_hash_key = this.get_session_to_question_key(
                collab_session_id,
                quiz_id,
                question_id,
            );

            const field_value_pairs: string[] = [];

            Object.entries(question_state).forEach(([field_name, field_value]) => {
                if (field_value === undefined) return;
                field_value_pairs.push(field_name, JSON.stringify(field_value));
            });

            if (field_value_pairs.length > 0) {
                await this.collab_state_cache.hset(question_hash_key, ...field_value_pairs);
            }
        } catch (err) {
            console.error('Error updating question state in Redis:', err);
            throw err;
        }
    }

    public async get_question(
        collab_session_id: string,
        quiz_id: string,
        question_id: string,
    ): Promise<QuestionType | null> {
        try {
            const question_hash_key = this.get_session_to_question_key(
                collab_session_id,
                quiz_id,
                question_id,
            );

            const data = await this.collab_state_cache.hgetall(question_hash_key);
            if (!data || Object.keys(data).length === 0) return null;

            const question: Record<string, any> = {};
            Object.entries(data).forEach(([field_name, field_value]) => {
                question[field_name] = this.parseField(field_value);
            });

            return question as QuestionType;
        } catch (err) {
            console.error('Error retrieving question from Redis:', err);
            return null;
        }
    }

    public async get_all_questions(
        collab_session_id: string,
        quiz_id: string,
    ): Promise<QuestionType[]> {
        try {
            const pattern = `collab:${collab_session_id}:quiz:${quiz_id}:question:*`;
            const question_keys: string[] = [];

            let cursor = '0';
            do {
                const [next_cursor, keys] = await this.collab_state_cache.scan(
                    cursor,
                    'MATCH',
                    pattern,
                    'COUNT',
                    100,
                );
                cursor = next_cursor;
                question_keys.push(...keys);
            } while (cursor !== '0');

            if (question_keys.length === 0) return [];

            const pipeline = this.collab_state_cache.pipeline();
            question_keys.forEach((key) => pipeline.hgetall(key));

            const results = await pipeline.exec();
            if (!results) return [];

            const questions: QuestionType[] = [];

            results.forEach(([err, data]) => {
                if (err || !data || Object.keys(data).length === 0) return;

                const question: Record<string, any> = {};
                Object.entries(data as Record<string, string>).forEach(
                    ([field_name, field_value]) => {
                        question[field_name] = this.parseField(field_value);
                    },
                );
                questions.push(question as QuestionType);
            });

            return questions.sort((a, b) => a.orderIndex - b.orderIndex);
        } catch (err) {
            console.error('Error retrieving all questions from Redis:', err);
            return [];
        }
    }

    public async cleanup_session(collab_session_id: string, quiz_id: string) {
        try {
            const pattern = `collab:${collab_session_id}:quiz:${quiz_id}:question:*`;
            let cursor = '0';

            do {
                const [next_cursor, keys] = await this.collab_state_cache.scan(
                    cursor,
                    'MATCH',
                    pattern,
                    'COUNT',
                    100,
                );
                cursor = next_cursor;
                if (keys.length > 0) {
                    await this.collab_state_cache.del(...keys);
                }
            } while (cursor !== '0');

            const quiz_key = this.get_session_to_quiz_key(collab_session_id, quiz_id);
            await this.collab_state_cache.del(quiz_key);
        } catch (err) {
            console.error('Error cleaning up session:', err);
        }
    }

    private parseField(value: string): any {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    private get_session_to_quiz_key(collab_session_id: string, quiz_id: string) {
        return `collab:${collab_session_id}:quiz:${quiz_id}`;
    }

    private get_session_to_question_key(
        collab_session_id: string,
        quiz_id: string,
        question_id: string,
    ) {
        return `collab:${collab_session_id}:quiz:${quiz_id}:question:${question_id}`;
    }
}
