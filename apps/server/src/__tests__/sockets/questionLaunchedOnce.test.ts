import { describe, expect, it, vi } from 'vitest';
import { MESSAGE_TYPES, PubSubMessageTypes } from '@nocturn/types';
import HostManager from '../../sockets/HostManager';
import type RedisCache from '../../cache/redis.cache';

// ---------------------------------------------------------------------------
// Mirrors the production race that starts a question twice from a single tap
// on "start": the question's isAsked flag only reaches the quiz cache after
// the database queue job finishes (>= 1s later), so two launch messages that
// arrive before that job has run both pass the check.
// ---------------------------------------------------------------------------

class FakeRedisCache {
    private launched_questions = new Set<string>();

    async get_quiz() {
        return {
            questions: [
                {
                    id: 'question-1',
                    orderIndex: 0,
                    isAsked: false,
                    readingTime: 5,
                    timeLimit: 20,
                    question: 'What?',
                    correctAnswer: 0,
                },
            ],
        };
    }

    async mark_question_launched(_game_session_id: string, question_id: string) {
        if (this.launched_questions.has(question_id)) return false;
        this.launched_questions.add(question_id);
        return true;
    }
}

function build_manager() {
    const quiz_manager = {
        publish_event_to_redis: vi.fn(
            async (_game_session_id: string, _event: PubSubMessageTypes) => {},
        ),
    };
    const database_queue = {
        update_game_session: vi.fn(
            async (
                _id: string,
                _game_session: Record<string, unknown>,
                _game_session_id: string,
            ) => ({}),
        ),
        update_question: vi.fn(
            async (
                _game_session_id: string,
                _question_id: string,
                _question: Record<string, unknown>,
            ) => ({}),
        ),
        update_participant: vi.fn(
            async (
                _id: string,
                _participant: Record<string, unknown>,
                _game_session_id: string,
            ) => ({}),
        ),
        update_quiz: vi.fn(
            async (_id: string, _quiz: Record<string, unknown>, _game_session_id: string) => ({}),
        ),
    };
    const phase_queue = { schedule_phase_transition: vi.fn(async () => {}) };
    const redis_cache = new FakeRedisCache();
    const manager = new HostManager({
        publisher: {} as never,
        subscriber: {} as never,
        socketMapping: new Map(),
        sessionHostMapping: new Map(),
        quizManager: quiz_manager as never,
        databaseQueue: database_queue as never,
        redis_cache: redis_cache as unknown as RedisCache,
        phase_queue: phase_queue as never,
    });
    return { manager, quiz_manager, database_queue, phase_queue };
}

function build_ws() {
    return {
        id: 'host-socket-1',
        user: {
            userId: 'host-1',
            gameSessionId: 'session-1',
            quizId: 'quiz-1',
            role: 'HOST',
        },
        send: vi.fn(),
        close: vi.fn(),
        readyState: 1,
    } as never;
}

describe('host question launch', () => {
    it('starts a question only once when the launch event arrives twice', async () => {
        const { manager, quiz_manager, database_queue, phase_queue } = build_manager();
        const ws = build_ws();
        const payload = { questionId: 'question-1', questionIndex: 0 };

        await Promise.all([
            (
                manager as unknown as {
                    handle_question_launch: (payload: unknown, ws: unknown) => Promise<void>;
                }
            ).handle_question_launch(payload, ws),
            (
                manager as unknown as {
                    handle_question_launch: (payload: unknown, ws: unknown) => Promise<void>;
                }
            ).handle_question_launch(payload, ws),
        ]);

        const reading_events = quiz_manager.publish_event_to_redis.mock.calls.filter(
            ([, event]) => event.type === MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT,
        );
        expect(reading_events).toHaveLength(1);
        expect(phase_queue.schedule_phase_transition).toHaveBeenCalledTimes(1);
        expect(database_queue.update_game_session).toHaveBeenCalledTimes(1);
    });
});
