import Redis from 'ioredis';
import { env } from '../configs/env';
import {
    COLLABORATORS_MESSAGE_TYPE,
    mergeQuestionEdit,
    QuestionEdit,
    QuestionType,
} from '@nocturn/types';

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
                    question_pipeline.hsetnx(
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
        edit: QuestionEdit,
    ) {
        const key = this.get_session_to_question_key(collab_session_id, quiz_id, edit.base.id);
        // Compare the snapshot and publish in the same Redis operation. A competing
        // writer makes us re-read and check the original edit again, never overwrite it.
        for (;;) {
            const snapshot = await this.collab_state_cache.hgetall(key);
            const current = {
                ...edit.base,
                ...Object.fromEntries(
                    Object.entries(snapshot).map(([field, value]) => [
                        field,
                        this.parseField(value),
                    ]),
                ),
            };
            const result = mergeQuestionEdit(current, edit);
            const event = {
                type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE,
                payload: { mutationId: edit.mutationId, ...result },
            };
            const applied = await this.collab_state_cache.eval(
                `local expected = cjson.decode(ARGV[1])
                local actual = redis.call('HGETALL', KEYS[1])
                local count = 0
                for field, value in pairs(expected) do
                    count = count + 1
                    if redis.call('HGET', KEYS[1], field) ~= value then return 0 end
                end
                if #actual ~= count * 2 then return 0 end
                local question = cjson.decode(ARGV[2])
                for field, value in pairs(question) do
                    redis.call('HSET', KEYS[1], field, value)
                end
                redis.call('EXPIRE', KEYS[1], 86400)
                redis.call('PUBLISH', ARGV[3], ARGV[4])
                return 1`,
                1,
                key,
                JSON.stringify(snapshot),
                JSON.stringify(
                    Object.fromEntries(
                        Object.entries(result.question).map(([field, value]) => [
                            field,
                            JSON.stringify(value),
                        ]),
                    ),
                ),
                `collab_session:${collab_session_id}`,
                JSON.stringify(event),
            );
            if (applied === 1) return;
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
            if (!results) throw new Error('Could not read collaborative questions');

            const questions: QuestionType[] = [];

            results.forEach(([err, data]) => {
                if (err) throw err;
                if (!data || Object.keys(data).length === 0) return;

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
            throw err;
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
