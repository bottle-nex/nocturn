import { describe, expect, it, vi } from 'vitest';
import { MESSAGE_TYPES, PubSubMessageTypes } from '@nocturn/types';
import ParticipantManager from '../../sockets/ParticipantManager';
import type RedisCache from '../../cache/redis.cache';

// ---------------------------------------------------------------------------
// Mirrors the production race that lets a participant score twice by tapping
// an answer fast: the response only reaches Redis after the database queue
// job finishes (>= 1s later), so the "already answered" check cannot separate
// two taps that arrive before that job has run.
// ---------------------------------------------------------------------------

class FakeRedisCache {
    public leaderboard_increments: { participant_id: string; points: number }[] = [];
    private claimed_responses = new Set<string>();

    async get_game_session() {
        return {
            currentPhase: 'QUESTION_ACTIVE',
            currentQuestionId: 'question-1',
            phaseStartTime: new Date(Date.now() - 1000),
            phaseEndTime: new Date(Date.now() + 30_000),
        };
    }

    async get_quiz() {
        return {
            timeBonus: true,
            questions: [{ id: 'question-1', correctAnswer: 0, timeLimit: 30, basePoints: 100 }],
        };
    }

    async get_participant() {
        return { totalScore: 0, correctAnswers: 0, currentStreak: 0, longestStreak: 0 };
    }

    async set_participant() {}

    async get_participant_response() {
        // production behaviour: the response is not in Redis yet when the
        // second fast tap is being handled
        return null;
    }

    async set_participant_response_if_absent(
        _game_session_id: string,
        question_id: string,
        participant_id: string,
    ) {
        const key = `${question_id}_${participant_id}`;
        if (this.claimed_responses.has(key)) return false;
        this.claimed_responses.add(key);
        return true;
    }

    async update_leaderboard_score(
        _game_session_id: string,
        participant_id: string,
        points: number,
    ) {
        this.leaderboard_increments.push({ participant_id, points });
        return points;
    }
}

function build_manager() {
    const quiz_manager = {
        publish_event_to_redis: vi.fn(
            async (_game_session_id: string, _event: PubSubMessageTypes) => {},
        ),
    };
    const database_queue = {
        create_participant_response: vi.fn(
            async (
                _participant_id: string,
                _game_session_id: string,
                _response: Record<string, unknown>,
            ) => ({}),
        ),
        update_participant: vi.fn(
            async (
                _participant_id: string,
                _data: { totalScore: unknown },
                _game_session_id: string,
            ) => ({ data: { participant: {} } }),
        ),
    };
    const redis_cache = new FakeRedisCache();
    const manager = new ParticipantManager({
        publisher: {} as never,
        subscriber: {} as never,
        socket_mapping: new Map(),
        session_participants_mapping: new Map(),
        session_spectators_mapping: new Map(),
        quizManager: quiz_manager as never,
        databaseQueue: database_queue as never,
        redis_cache: redis_cache as unknown as RedisCache,
    });
    return { manager, quiz_manager, database_queue, redis_cache };
}

function build_ws() {
    return {
        id: 'socket-1',
        user: {
            userId: 'participant-1',
            gameSessionId: 'session-1',
            quizId: 'quiz-1',
            role: 'PARTICIPANT',
        },
        send: vi.fn(),
        close: vi.fn(),
        readyState: 1,
    } as never;
}

describe('participant answer scoring', () => {
    it('scores a fast double tap on the same question only once', async () => {
        const { manager, quiz_manager, database_queue, redis_cache } = build_manager();
        const ws = build_ws();

        await Promise.all([
            (
                manager as unknown as {
                    handle_participant_response: (payload: unknown, ws: unknown) => Promise<void>;
                }
            ).handle_participant_response({ selectedAnswer: 0 }, ws),
            (
                manager as unknown as {
                    handle_participant_response: (payload: unknown, ws: unknown) => Promise<void>;
                }
            ).handle_participant_response({ selectedAnswer: 0 }, ws),
        ]);

        expect(database_queue.create_participant_response).toHaveBeenCalledTimes(1);
        expect(database_queue.update_participant).toHaveBeenCalledTimes(1);
        expect(redis_cache.leaderboard_increments).toHaveLength(1);

        // the rejected tap must be told the option was already picked
        const rejected_tap_events = quiz_manager.publish_event_to_redis.mock.calls.filter(
            ([, event]) =>
                event.type === MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE &&
                event.payload?.error === 'Already opted an option.',
        );
        expect(rejected_tap_events).toHaveLength(1);
    });

    it('adds earned points to the stored total instead of overwriting it', async () => {
        const { manager, database_queue } = build_manager();
        const ws = build_ws();

        await (
            manager as unknown as {
                handle_participant_response: (payload: unknown, ws: unknown) => Promise<void>;
            }
        ).handle_participant_response({ selectedAnswer: 0 }, ws);

        const update_data = database_queue.update_participant.mock.calls[0]?.[1];
        // the update must not depend on the (possibly stale) cached totalScore
        expect(update_data.totalScore).toEqual({ increment: expect.any(Number) });
    });
});
