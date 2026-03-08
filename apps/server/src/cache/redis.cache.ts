import { GameSession, Question, Response, Spectator, Template, User } from '@nocturn/database';
import Redis from 'ioredis';
import { Participant, Quiz } from '@nocturn/database';
import { env } from '../configs/env';
import { SubscriptionEnum } from '@nocturn/types';

const SECONDS = 60;
const MINUTES = 60;
const HOURS = 24;
const REDIS_URL = env.SERVER_REDIS_URL;

type QuizWithQuestions = Quiz & {
    questions: Question[];
    template?: Template;
    host?: { name: string | null; image: string | null; email: string };
};

// interface LifelineSession {
//     requestingParticipantId: string;
//     expiresAt: number;
//     responses: Record<string, number>;
//     created_at: number;
// }

export default class RedisCache {
    public redis_cache: Redis;

    constructor() {
        this.redis_cache = new Redis(REDIS_URL!);
    }

    //  <------------------ GAME_SESSION ------------------>

    public async set_game_session(
        game_live_session_id: string,
        game_live_session: Partial<GameSession>,
    ) {
        try {
            const key = this.get_game_session_key(game_live_session_id);
            const entries: [string, string][] = Object.entries(game_live_session).map(
                ([key, value]) => [key, JSON.stringify(value)],
            );
            await this.redis_cache.hset(key, ...entries.flat());
            await this.redis_cache.expire(key, SECONDS * MINUTES * HOURS);
        } catch (err) {
            console.error('Error in session management while creating session', err);
        }
    }

    public async get_game_session(
        sessionId: string,
        fields?: (keyof GameSession)[],
    ): Promise<Partial<GameSession> | null> {
        try {
            const key = this.get_game_session_key(sessionId);
            const data = await this.redis_cache.hgetall(key);

            if (Object.keys(data).length === 0) return null;

            const parsed: Partial<GameSession> = {};

            for (const [key, value] of Object.entries(data)) {
                try {
                    parsed[key as keyof GameSession] = JSON.parse(value);
                } catch {
                    parsed[key as keyof GameSession] = value as any;
                }
            }

            // Apply field filtering if fields are specified
            if (fields && fields.length > 0) {
                const filtered: Partial<GameSession> = {};
                for (const field of fields) {
                    if (parsed[field] !== undefined) {
                        filtered[field] = parsed[field] as any;
                    }
                }
                return filtered;
            }

            return parsed;
        } catch (err) {
            console.error('RedisCache error get_game_session : ', err);
            return null;
        }
    }

    public async delete_game_session(game_live_session_id: string) {
        try {
            const key = this.get_game_session_key(game_live_session_id);
            await this.redis_cache.del(key);
        } catch (err) {
            console.error('RedisCache error delete_game_session : ', err);
        }
    }

    private get_game_session_key(game_live_session_id: string) {
        return `game_session:${game_live_session_id}`;
    }

    //  <------------------ HOST ------------------>

    public async set_host(
        game_session_id: string,
        host_id: string,
        host: Partial<User> & { subscription: SubscriptionEnum },
    ) {
        try {
            const host_key = this.get_host_key(game_session_id);
            const pipeline = this.redis_cache.pipeline();

            Object.entries(host).forEach(([field, value]) => {
                const field_key = `${host_id}:${field}`;
                const field_value = typeof value === 'string' ? value : JSON.stringify(value);
                pipeline.hset(host_key, field_key, field_value);
            });

            await pipeline.exec();
            await this.redis_cache.expire(host_key, SECONDS * MINUTES * HOURS);
        } catch (err) {
            console.error('Error while setting participant in cache : ', err);
        }
    }

    public async get_host(
        game_session_id: string,
        host_id: string,
        fields?: (keyof User | 'subscription')[],
    ): Promise<(Partial<User> & { subscription?: SubscriptionEnum }) | null> {
        const host_key = this.get_host_key(game_session_id);

        try {
            const host: Record<string, unknown> = {};
            const match_pattern = `${host_id}:*`;
            let cursor = '0';

            do {
                const [nextCursor, results] = await this.redis_cache.hscan(
                    host_key,
                    cursor,
                    'MATCH',
                    match_pattern,
                    'COUNT',
                    100,
                );

                cursor = nextCursor;

                for (let i = 0; i < results.length; i += 2) {
                    const field_name = results[i].slice(host_id.length + 1);

                    try {
                        host[field_name] = JSON.parse(results[i + 1]);
                    } catch {
                        host[field_name] = results[i + 1];
                    }
                }
            } while (cursor !== '0');

            if (Object.keys(host).length === 0) return null;

            // field filtering (same behavior as get_all_participants)
            if (fields && fields.length > 0) {
                const filtered: Record<string, unknown> = {};
                for (const field of fields) {
                    if (host[field] !== undefined) {
                        filtered[field] = host[field];
                    }
                }
                return filtered as Partial<User>;
            }

            return host as Partial<User>;
        } catch (err) {
            console.error('Error in get_host :', err);
            return null;
        }
    }

    public get_host_key(game_session_id: string) {
        return `game_session:${game_session_id}:host`;
    }

    //  <------------------ PARTICIPANT ------------------>

    public async get_participant(
        game_session_id: string,
        participant_id: string,
    ): Promise<Participant | null> {
        const participant_key = this.get_participants_key(game_session_id);
        try {
            const participant: Record<string, unknown> = {};
            const match_pattern = `${participant_id}:*`;
            let cursor = '0';

            do {
                const [nextCursor, results] = await this.redis_cache.hscan(
                    participant_key,
                    cursor,
                    'MATCH',
                    match_pattern,
                    'COUNT',
                    100,
                );
                cursor = nextCursor;

                for (let i = 0; i < results.length; i += 2) {
                    const field_name = results[i].slice(participant_id.length + 1);
                    try {
                        participant[field_name] = JSON.parse(results[i + 1]);
                    } catch {
                        participant[field_name] = results[i + 1];
                    }
                }
            } while (cursor !== '0');

            return Object.keys(participant).length > 0 ? (participant as Participant) : null;
        } catch (err) {
            console.error('Error in get_participant :', err);
            return null;
        }
    }

    public async get_all_participants(game_session_id: string, fields?: (keyof Participant)[]) {
        const participant_key = this.get_participants_key(game_session_id);
        try {
            const data = await this.redis_cache.hgetall(participant_key);
            if (!data || Object.keys(data).length === 0) return [];

            const participants_map: Record<string, Record<string, unknown>> = {};

            Object.entries(data).forEach(([field, value]) => {
                const [participant_id, field_name] = field.split(':');
                if (!participants_map[participant_id]) {
                    participants_map[participant_id] = {};
                }
                try {
                    participants_map[participant_id][field_name] = JSON.parse(value);
                } catch {
                    participants_map[participant_id][field_name] = value;
                }
            });

            return Object.entries(participants_map).map(([id, participant]) => {
                if (fields && fields.length > 0) {
                    const filtered: Record<string, unknown> = { id };
                    for (const field of fields) {
                        if (participant[field] !== undefined) {
                            filtered[field] = participant[field];
                        }
                    }
                    return filtered;
                }
                return { id, ...participant };
            });
        } catch (err) {
            console.error('Error in get_all_participants_v2:', err);
            return [];
        }
    }

    public async set_participant(
        game_session_id: string,
        participant_id: string,
        particpant: Partial<Participant>,
    ) {
        try {
            const participant_key = this.get_participants_key(game_session_id);
            const pipeline = this.redis_cache.pipeline();

            Object.entries(particpant).forEach(([field, value]) => {
                const field_key = `${participant_id}:${field}`;
                const field_value = typeof value === 'string' ? value : JSON.stringify(value);
                pipeline.hset(participant_key, field_key, field_value);
            });

            await pipeline.exec();
            await this.redis_cache.expire(participant_key, 60 * 60 * 24);
        } catch (err) {
            console.error('Error while setting participant in cache : ', err);
        }
    }

    public async delete_participant(game_session_id: string, participant_id: string) {
        const key = this.get_participants_key(game_session_id);
        try {
            const data = await this.redis_cache.hgetall(key);
            if (!data) return;

            const fields_to_delete: string[] = [];
            const prefix = `${participant_id}:`;

            for (const field of Object.keys(data)) {
                if (field.startsWith(prefix)) {
                    fields_to_delete.push(field);
                }
            }

            if (fields_to_delete.length > 0) {
                await this.redis_cache.hdel(key, ...fields_to_delete);
            }
        } catch (error) {
            console.error('Error in delete_participant:', error);
        }
    }

    public get_participants_key(game_session_id: string) {
        return `game_session:${game_session_id}:participants`;
    }

    //  <------------------ RESPONSE ------------------>

    public async set_participant_response(
        game_session_id: string,
        question_id: string,
        participant_id: string,
        response: Partial<Response>,
    ) {
        try {
            const key = this.get_participant_response_key(game_session_id);
            const unique_key = this.get_unique_key_to_response(question_id, participant_id);

            await this.redis_cache.hset(key, unique_key, JSON.stringify(response));
            await this.redis_cache.expire(key, 60 * 60 * 24);
        } catch (error) {
            console.error('Error while setting participant response in cache: ', error);
        }
    }

    public async get_participant_response(
        game_session_id: string,
        question_id: string,
        participant_id: string,
    ) {
        try {
            const key = this.get_participant_response_key(game_session_id);
            const unique_key = this.get_unique_key_to_response(question_id, participant_id);

            const data = await this.redis_cache.hget(key, unique_key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error while getting participant response from cache: ', error);
            return null;
        }
    }

    public async get_all_question_responses(
        game_session_id: string,
        question_id: string,
        fields?: (keyof Response)[],
    ) {
        const key = this.get_participant_response_key(game_session_id);
        try {
            const data = await this.redis_cache.hgetall(key);
            if (!data) return [];

            return Object.entries(data)
                .filter(
                    ([unique_key]) =>
                        unique_key.startsWith(`${question_id}`) ||
                        unique_key.startsWith(`${question_id}_`),
                )
                .map(([unique_key, value]) => {
                    const response = JSON.parse(value);
                    const participant_id = unique_key.split('_')[1];

                    if (fields && fields.length > 0) {
                        const filtered: any = {
                            id: response.id,
                            participantId: participant_id,
                        };
                        for (const field of fields) {
                            if (response[field] !== undefined) {
                                filtered[field] = response[field];
                            }
                        }
                        return filtered;
                    }

                    return { id: response.id, participantId: participant_id, ...response };
                });
        } catch (err) {
            console.error('Error in get_all_question_responses:', err);
            return [];
        }
    }

    private get_unique_key_to_response(question_id: string, participant_id: string) {
        return `${question_id}_${participant_id}`;
    }

    private get_participant_response_key(game_session_id: string) {
        return `game_session:${game_session_id}:responses`;
    }

    //  <------------------ SPECTATOR ------------------>

    public async set_spectator(
        game_session_id: string,
        spectator_id: string,
        spectator: Partial<Spectator>,
    ) {
        try {
            const key = this.get_spectator_key(game_session_id);
            await this.redis_cache.hset(key, spectator_id, JSON.stringify(spectator));
            await this.redis_cache.expire(key, 60 * 60 * 24);
        } catch (error) {
            console.error('Error while setting spectator in cache: ', error);
        }
    }

    public async get_spectator(game_session_id: string, spectator_id: string) {
        const key = this.get_spectator_key(game_session_id);
        try {
            const data = await this.redis_cache.hget(key, spectator_id);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error in get-spectator: ', error);
            return null;
        }
    }

    public async get_all_spectators(game_session_id: string, fields?: (keyof Spectator)[]) {
        const key = this.get_spectator_key(game_session_id);
        try {
            const data = await this.redis_cache.hgetall(key);
            if (!data) return [];

            return Object.entries(data).map(([id, value]) => {
                const spectator = JSON.parse(value);

                if (fields && fields.length > 0) {
                    const filtered: any = { id };
                    for (const field of fields) {
                        if (spectator[field] !== undefined) {
                            filtered[field] = spectator[field];
                        }
                    }
                    return filtered;
                }

                return { id, ...spectator };
            });
        } catch (err) {
            console.error('Error in get_all_spectators:', err);
            return [];
        }
    }

    public async delete_spectator(game_session_id: string, spectator_id: string) {
        const key = this.get_spectator_key(game_session_id);
        try {
            await this.redis_cache.hdel(key, spectator_id);
        } catch (error) {
            console.error('Error in delete-spectator: ', error);
        }
    }

    public get_spectator_key(game_session_id: string) {
        return `game_session:${game_session_id}:spectators`;
    }

    //  <------------------ QUIZ ------------------>

    public async set_quiz(game_session_id: string, quiz: Partial<QuizWithQuestions>) {
        try {
            const key = this.get_quiz_key(game_session_id);

            const entries: [string, string][] = Object.entries(quiz).map(([key, value]) => [
                key,
                JSON.stringify(value),
            ]);
            await this.redis_cache.hset(key, ...entries.flat());
            await this.redis_cache.expire(key, SECONDS * MINUTES * HOURS);
        } catch (error) {
            console.error('Error while setting quiz in cache : ', error);
        }
    }

    public async get_quiz(
        game_session_id: string,
        fields?: (keyof QuizWithQuestions)[],
    ): Promise<Partial<QuizWithQuestions> | null> {
        try {
            const key = this.get_quiz_key(game_session_id);
            const data = await this.redis_cache.hgetall(key);

            if (Object.keys(data).length === 0) return null;

            const parsed: Partial<Quiz> = {};
            for (const [key, value] of Object.entries(data)) {
                try {
                    const parsedValue = JSON.parse(value);
                    parsed[key as keyof Quiz] = parsedValue;
                } catch (parseError) {
                    if (key === 'questions') {
                        console.error(
                            `Critical field 'questions' failed to parse. Raw value:`,
                            parseError,
                        );
                        return null;
                    }
                    parsed[key as keyof Quiz] = value as any;
                }
            }

            const result = parsed as Partial<QuizWithQuestions>;

            // Apply field filtering if fields are specified
            if (fields && fields.length > 0) {
                const filtered: Partial<QuizWithQuestions> = {};
                for (const field of fields) {
                    if (field in result) {
                        filtered[field] = result[field] as any;
                    }
                }
                return filtered;
            }

            return result;
        } catch (error) {
            console.error('RedisCache error get_quiz : ', error);
            return null;
        }
    }

    private get_quiz_key(game_session_id: string): string {
        return `game_session:${game_session_id}:quiz`;
    }

    //  <------------------ BATCH (PIPELINE) ------------------>

    public async get_live_quiz_batch(
        game_session_id: string,
        participantFields?: (keyof Participant)[],
        spectatorFields?: (keyof Spectator)[],
    ) {
        try {
            const gameSessionKey = this.get_game_session_key(game_session_id);
            const quizKey = this.get_quiz_key(game_session_id);
            const participantsKey = this.get_participants_key(game_session_id);
            const spectatorKey = this.get_spectator_key(game_session_id);

            const pipeline = this.redis_cache.pipeline();
            pipeline.hgetall(gameSessionKey);
            pipeline.hgetall(quizKey);
            pipeline.hgetall(participantsKey);
            pipeline.hgetall(spectatorKey);

            const results = await pipeline.exec();
            if (!results) {
                return {
                    gameSession: null,
                    quiz: null,
                    cachedParticipants: [],
                    cachedSpectators: [],
                };
            }
            const [gsErr, gsData] = results[0] as [Error | null, Record<string, string>];
            let gameSession: Partial<GameSession> | null = null;
            if (!gsErr && gsData && Object.keys(gsData).length > 0) {
                const parsed: Partial<GameSession> = {};
                for (const [key, value] of Object.entries(gsData)) {
                    try {
                        parsed[key as keyof GameSession] = JSON.parse(value);
                    } catch {
                        parsed[key as keyof GameSession] = value as any;
                    }
                }
                gameSession = parsed;
            }

            // Parse quiz
            const [qErr, qData] = results[1] as [Error | null, Record<string, string>];
            let quiz: Partial<QuizWithQuestions> | null = null;
            if (!qErr && qData && Object.keys(qData).length > 0) {
                const parsed: Partial<Quiz> = {};
                for (const [key, value] of Object.entries(qData)) {
                    try {
                        parsed[key as keyof Quiz] = JSON.parse(value);
                    } catch {
                        if (key === 'questions') {
                            console.error(`Critical field 'questions' failed to parse in batch.`);
                            return {
                                gameSession,
                                quiz: null,
                                cachedParticipants: [],
                                cachedSpectators: [],
                            };
                        }
                        parsed[key as keyof Quiz] = value as any;
                    }
                }
                quiz = parsed as Partial<QuizWithQuestions>;
            }

            // Parse participants
            const [pErr, pData] = results[2] as [Error | null, Record<string, string>];
            let cachedParticipants: Record<string, unknown>[] = [];
            if (!pErr && pData && Object.keys(pData).length > 0) {
                const participantsMap: Record<string, Record<string, unknown>> = {};
                for (const [field, value] of Object.entries(pData)) {
                    const [participantId, fieldName] = field.split(':');
                    if (!participantsMap[participantId]) {
                        participantsMap[participantId] = {};
                    }
                    try {
                        participantsMap[participantId][fieldName] = JSON.parse(value);
                    } catch {
                        participantsMap[participantId][fieldName] = value;
                    }
                }
                cachedParticipants = Object.entries(participantsMap).map(([id, participant]) => {
                    if (participantFields && participantFields.length > 0) {
                        const filtered: Record<string, unknown> = { id };
                        for (const field of participantFields) {
                            if (participant[field] !== undefined) {
                                filtered[field] = participant[field];
                            }
                        }
                        return filtered;
                    }
                    return { id, ...participant };
                });
            }

            // Parse spectators
            const [sErr, sData] = results[3] as [Error | null, Record<string, string>];
            let cachedSpectators: Record<string, unknown>[] = [];
            if (!sErr && sData && Object.keys(sData).length > 0) {
                cachedSpectators = Object.entries(sData).map(([id, value]) => {
                    const spectator = JSON.parse(value);
                    if (spectatorFields && spectatorFields.length > 0) {
                        const filtered: any = { id };
                        for (const field of spectatorFields) {
                            if (spectator[field] !== undefined) {
                                filtered[field] = spectator[field];
                            }
                        }
                        return filtered;
                    }
                    return { id, ...spectator };
                });
            }

            return { gameSession, quiz, cachedParticipants, cachedSpectators };
        } catch (err) {
            console.error('Error in get_live_quiz_batch:', err);
            return { gameSession: null, quiz: null, cachedParticipants: [], cachedSpectators: [] };
        }
    }

    //  <------------------ PHASE ------------------>

    public async try_acquire_lock(lock_key: string, lock_value: string, ttl_seconds: number) {
        try {
            const result = await this.redis_cache.set(
                lock_key,
                lock_value,
                'EX',
                ttl_seconds,
                'NX',
            );
            return result === 'OK';
        } catch (err) {
            console.error('error in try_acquire_lock', err);
        }
    }

    public async renew_lock(lock_key: string, ttl_seconds: number): Promise<boolean> {
        try {
            const result = await this.redis_cache.expire(lock_key, ttl_seconds);
            return result === 1;
        } catch (err) {
            console.error(`Error renewing lock ${lock_key}:`, err);
            return false;
        }
    }

    public async get_lock_owner(lock_key: string): Promise<string | null> {
        try {
            return await this.redis_cache.get(lock_key);
        } catch (err) {
            console.error(`Error reading lock owner ${lock_key}:`, err);
            return null;
        }
    }

    //  <------------------ LIFELINE-EVENTS ------------------>

    public async cache_participant_lifeline_used(game_session_id: string, participant_id: string) {
        try {
            const key = this.get_lifeline_key(game_session_id);
            await this.redis_cache.hset(key, participant_id, 'used');
            await this.redis_cache.expire(key, 60 * 60 * 24);
        } catch (error) {
            console.error('Error caching lifeline usage: ', error);
            return null;
        }
    }

    public async get_cached_lifeline_usage(
        game_session_id: string,
        participant_id: string,
    ): Promise<boolean | null> {
        try {
            const key = this.get_lifeline_key(game_session_id);
            const result = await this.redis_cache.hget(key, participant_id);
            return result === 'used' ? true : result === null ? null : false;
        } catch (error) {
            console.error('Error checking cached lifeline usage:', error);
            return null;
        }
    }

    private get_lifeline_key(game_session_id: string): string {
        return `game_session:${game_session_id}:lifelines`;
    }

    public async delete_active_lifeline_session(game_session_id: string, question_id: string) {
        try {
            const key = this.get_active_lifeline_key(game_session_id, question_id);
            await this.redis_cache.del(key);
        } catch (error) {
            console.error('Error deleting active lifeline session:', error);
        }
    }

    private get_active_lifeline_key(game_session_id: string, question_id: string): string {
        return `game_session:${game_session_id}:lifeline:${question_id}`;
    }

    public async add_spectator_lifeline_response(
        game_session_id: string,
        question_id: string,
        spectator_id: string,
        selected_option: number,
    ): Promise<boolean> {
        try {
            const key = this.get_active_lifeline_key(game_session_id, question_id);
            const session = await this.get_active_lifeline_session(game_session_id, question_id);

            if (!session) {
                console.error('No active lifeline session found');
                return false;
            }

            if (Date.now() > session.expiresAt) {
                console.error('Lifeline session expired');
                await this.delete_active_lifeline_session(game_session_id, question_id);
                return false;
            }

            session.responses[spectator_id] = selected_option;

            const remainingTTL = Math.ceil((session.expiresAt - Date.now()) / 1000);
            if (remainingTTL <= 0) {
                await this.delete_active_lifeline_session(game_session_id, question_id);
                return false;
            }

            await this.redis_cache.set(key, JSON.stringify(session), 'EX', remainingTTL);
            return true;
        } catch (error) {
            console.error('Error adding spectator lifeline response:', error);
            return false;
        }
    }

    public async get_lifeline_results(
        game_session_id: string,
        question_id: string,
    ): Promise<{
        optionCounts: number[];
        totalResponses: number;
        mostPopularOption: number | null;
        wasSuccessful: boolean;
    } | null> {
        try {
            const session = await this.get_active_lifeline_session(game_session_id, question_id);
            if (!session) return null;

            const optionCounts = [0, 0, 0, 0];
            let totalResponses = 0;

            Object.values(session.responses).forEach((option) => {
                if (option >= 0 && option <= 3) {
                    optionCounts[option]!++;
                    totalResponses++;
                }
            });

            let mostPopularOption: number | null = null;
            let maxVotes = 0;

            optionCounts.forEach((count, index) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    mostPopularOption = index;
                }
            });

            const wasSuccessful = totalResponses >= 3 && maxVotes > totalResponses * 0.5;

            return {
                optionCounts,
                totalResponses,
                mostPopularOption,
                wasSuccessful,
            };
        } catch (error) {
            console.error('Error getting lifeline results:', error);
            return null;
        }
    }

    public async cleanup_all_lifeline_sessions(game_session_id: string): Promise<void> {
        try {
            const pattern = `game_session:${game_session_id}:lifeline:*`;
            const keys = await this.redis_cache.keys(pattern);
            if (keys.length > 0) {
                await this.redis_cache.del(...keys);
            }
        } catch (error) {
            console.error('Error cleaning up lifeline sessions:', error);
        }
    }

    public async set_active_lifeline_session(
        game_session_id: string,
        question_id: string,
        participant_id: string,
        expiry_seconds: number = 60,
    ): Promise<boolean> {
        try {
            const key = this.get_active_lifeline_key(game_session_id, question_id);
            const existing = await this.get_active_lifeline_session(game_session_id, question_id);

            if (existing) {
                if (!existing.requestingParticipants.includes(participant_id)) {
                    existing.requestingParticipants.push(participant_id);
                    const remainingTTL = Math.ceil((existing.expiresAt - Date.now()) / 1000);
                    if (remainingTTL > 0) {
                        await this.redis_cache.set(
                            key,
                            JSON.stringify(existing),
                            'EX',
                            remainingTTL,
                        );
                        return true;
                    }
                }
                return true;
            }

            const data = {
                questionId: question_id,
                requestingParticipants: [participant_id],
                responses: {},
                createdAt: Date.now(),
                expiresAt: Date.now() + expiry_seconds * 1000,
            };
            await this.redis_cache.set(key, JSON.stringify(data), 'EX', expiry_seconds);
            return true;
        } catch (error) {
            console.error('Error setting active lifeline session:', error);
            return false;
        }
    }

    public async get_active_lifeline_session(
        game_session_id: string,
        question_id: string,
    ): Promise<{
        questionId: string;
        requestingParticipants: string[];
        responses: Record<string, number>;
        createdAt: number;
        expiresAt: number;
    } | null> {
        try {
            const key = this.get_active_lifeline_key(game_session_id, question_id);
            const data = await this.redis_cache.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting active lifeline session:', error);
            return null;
        }
    }

    public async has_participant_requested_lifeline(
        game_session_id: string,
        question_id: string,
        participant_id: string,
    ): Promise<boolean> {
        try {
            const session = await this.get_active_lifeline_session(game_session_id, question_id);
            return session?.requestingParticipants.includes(participant_id) ?? false;
        } catch (error) {
            console.error('Error checking participant lifeline request:', error);
            return false;
        }
    }
}
