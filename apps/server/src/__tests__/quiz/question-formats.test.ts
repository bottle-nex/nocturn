import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getQuestionFormatDefaults, questionAnswerSchema, USER_TYPE } from '@nocturn/types';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { question_schema } from '../../gen/schemas/createNewQuizSchema';
import QuizAction from '../../class/quizAction';
import ParticipantManager, {
    type ParticipantManagerDependencies,
} from '../../sockets/ParticipantManager';
import RedisCache from '../../cache/redis.cache';
import type { GameWebSocket } from '../../types/web-socket-types';

vi.mock('../../configs/env', () => ({ env: {} }));

vi.mock('@nocturn/database', () => ({
    prisma: {},
    QuizPhase: { QUESTION_ACTIVE: 'QUESTION_ACTIVE' },
    HostScreen: {
        QUESTION_READING: 'QUESTION_READING',
        QUESTION_ACTIVE: 'QUESTION_ACTIVE',
        QUESTION_RESULTS: 'QUESTION_RESULTS',
    },
}));

const question = {
    ...getQuestionFormatDefaults('TRUE_FALSE'),
    question: 'The Sun is a star.',
    correctAnswer: 0,
    difficulty: 1,
    basePoints: 100,
    readingTime: 5,
    timeLimit: 30,
    orderIndex: 0,
    hintLaunched: false,
};

describe('question format validation', () => {
    it('accepts mixed quizzes and defaults legacy questions to multiple choice', () => {
        const quiz = createQuizSchema.parse({
            title: 'Mixed formats',
            questions: [question, { ...question, format: undefined, options: ['A', 'B', 'C'] }],
        });
        expect(quiz.questions.map((q) => q.format)).toEqual(['TRUE_FALSE', 'MULTIPLE_CHOICE']);
    });

    it.each([
        { format: 'UNKNOWN' },
        { options: ['False', 'True'] },
        { options: ['True', 'False', 'Maybe'] },
        { options: ['Yes', 'No'] },
        { correctAnswer: -1 },
        { correctAnswer: 2 },
        { correctAnswer: 0.5 },
    ])('rejects invalid true or false answers: %j', (change) => {
        expect(questionAnswerSchema.safeParse({ ...question, ...change }).success).toBe(false);
    });

    it('accepts either true or false as the correct answer', () => {
        expect(questionAnswerSchema.parse({ ...question, correctAnswer: 1 }).correctAnswer).toBe(1);
    });

    it('retains format and validates the answer in generated questions', () => {
        const generated = {
            ...question,
            explanation: 'The Sun produces its own light.',
            hint: 'It shines.',
        };
        expect(question_schema.parse(generated).format).toBe('TRUE_FALSE');
        expect(question_schema.safeParse({ ...generated, correctAnswer: 2 }).success).toBe(false);
    });

    it('enforces multiple choice bounds as well as true or false bounds', () => {
        const multipleChoice = getQuestionFormatDefaults('MULTIPLE_CHOICE');
        expect(
            questionAnswerSchema.safeParse({ ...multipleChoice, correctAnswer: 4 }).success,
        ).toBe(false);
        expect(
            questionAnswerSchema.safeParse({ ...multipleChoice, options: ['Only one'] }).success,
        ).toBe(false);
        expect(
            questionAnswerSchema.safeParse({ ...multipleChoice, options: Array(7).fill('Choice') })
                .success,
        ).toBe(false);
    });
});

describe('question visibility on reconnect', () => {
    it.each(['QUESTION_READING', 'QUESTION_ACTIVE'] as const)(
        'keeps the format without leaking the answer during %s',
        (screen) => {
            const visible = QuizAction.sanitizeCurrentQuestion(
                question,
                USER_TYPE.PARTICIPANT,
                screen,
            );
            expect(visible?.format).toBe('TRUE_FALSE');
            expect(visible).not.toHaveProperty('correctAnswer');
            if (screen === 'QUESTION_ACTIVE') expect(visible?.options).toEqual(['True', 'False']);
        },
    );

    it('reveals the correct answer with the format at results', () => {
        expect(
            QuizAction.sanitizeCurrentQuestion(question, USER_TYPE.PARTICIPANT, 'QUESTION_RESULTS'),
        ).toMatchObject({
            format: 'TRUE_FALSE',
            correctAnswer: 0,
            options: ['True', 'False'],
        });
    });
});

describe('true or false live grading', () => {
    const queue = {
        create_participant_response: vi.fn(),
        update_participant: vi.fn(),
    };
    const cache = {
        get_game_session: vi.fn(),
        get_participant_response: vi.fn().mockResolvedValue(null),
        get_quiz: vi.fn(),
        get_participant: vi.fn().mockResolvedValue({ totalScore: 0, currentStreak: 0 }),
        update_leaderboard_score: vi.fn(),
    };
    const manager = new ParticipantManager({
        databaseQueue: queue,
        redis_cache: cache,
        quizManager: { publish_event_to_redis: vi.fn() },
    } as unknown as ParticipantManagerDependencies);
    const ws = { user: { userId: 'participant', gameSessionId: 'session' } } as GameWebSocket;

    beforeEach(() => {
        vi.clearAllMocks();
        cache.get_game_session.mockResolvedValue({
            currentPhase: 'QUESTION_ACTIVE',
            currentQuestionId: 'q',
            phaseStartTime: new Date(),
            phaseEndTime: new Date(Date.now() + 30_000),
        });
        cache.get_quiz.mockResolvedValue({ questions: [{ ...question, id: 'q' }] });
    });

    it.each([
        [0, true, 110],
        [1, false, 0],
    ])(
        'grades option %i and updates the leaderboard',
        async (selectedAnswer, isCorrect, pointsEarned) => {
            await manager['handle_participant_response']({ selectedAnswer }, ws);
            expect(queue.create_participant_response).toHaveBeenCalledWith(
                'participant',
                'session',
                expect.objectContaining({
                    selectedAnswer,
                    isCorrect,
                    pointsEarned,
                }),
            );
            expect(cache.update_leaderboard_score).toHaveBeenCalledWith(
                'session',
                'participant',
                pointsEarned,
            );
        },
    );

    it('grades False as correct when configured by the host', async () => {
        cache.get_quiz.mockResolvedValue({
            questions: [{ ...question, id: 'q', correctAnswer: 1 }],
        });
        await manager['handle_participant_response']({ selectedAnswer: 1 }, ws);
        expect(queue.create_participant_response).toHaveBeenCalledWith(
            'participant',
            'session',
            expect.objectContaining({ isCorrect: true }),
        );
    });

    it.each([-1, 2, 0.5, NaN, Infinity, '0'])(
        'rejects invalid option %s without recording or scoring it',
        async (selectedAnswer) => {
            await manager['handle_participant_response']({ selectedAnswer }, ws);
            expect(queue.create_participant_response).not.toHaveBeenCalled();
            expect(cache.update_leaderboard_score).not.toHaveBeenCalled();
        },
    );
});

describe('spectator lifeline results', () => {
    it.each([2, 6])('counts only the %i available choices', async (optionCount) => {
        const cache = Object.create(RedisCache.prototype) as RedisCache;
        vi.spyOn(cache, 'get_active_lifeline_session').mockResolvedValue({
            questionId: 'q',
            requestingParticipants: [],
            createdAt: 0,
            expiresAt: Date.now() + 30_000,
            responses: { a: 1, b: 1, c: 1, invalid: optionCount, fractional: 0.5 },
        });
        vi.spyOn(cache, 'get_quiz').mockResolvedValue({
            questions: [{ id: 'q', options: Array(optionCount).fill('Choice') }],
        } as Awaited<ReturnType<RedisCache['get_quiz']>>);
        expect(await cache.get_lifeline_results('session', 'q')).toEqual({
            optionCounts: Array.from({ length: optionCount }, (_, index) => (index === 1 ? 3 : 0)),
            totalResponses: 3,
            mostPopularOption: 1,
            wasSuccessful: true,
        });
    });
});
