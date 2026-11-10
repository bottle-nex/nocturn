import { describe, expect, it, vi } from 'vitest';
import { hasValidQuestionOptions, isValidAnswerIndex, USER_TYPE } from '@nocturn/types';
import { questionSchema, createQuizSchema } from '../../schemas/createQuizSchema';
import { question_schema } from '../../gen/schemas/createNewQuizSchema';
import QuizAction from '../../class/quizAction';

vi.mock('@nocturn/database', () => ({
    prisma: {},
    HostScreen: {
        QUESTION_READING: 'QUESTION_READING',
        QUESTION_ACTIVE: 'QUESTION_ACTIVE',
        QUESTION_RESULTS: 'QUESTION_RESULTS',
    },
}));

const question = {
    question: 'The Earth orbits the Sun.',
    format: 'TRUE_FALSE',
    options: ['True', 'False'],
    correctAnswer: 0,
    explanation: 'Earth revolves around the Sun.',
    hint: 'Think about the solar system.',
    difficulty: 1,
    basePoints: 100,
    timeLimit: 30,
    readingTime: 7,
    orderIndex: 0,
    hintLaunched: false,
};

describe('question formats', () => {
    it('keeps older quizzes and drafts as multiple choice', () => {
        const { format: _format, ...legacy } = question;
        expect(questionSchema.parse(legacy).format).toBe('MULTIPLE_CHOICE');
    });

    it.each([0, 1])('accepts true/false with correct answer %i', (correctAnswer) => {
        const result = createQuizSchema.parse({
            title: 'Science',
            questions: [{ ...question, correctAnswer }],
        });
        expect(result.questions[0]).toMatchObject({
            format: 'TRUE_FALSE',
            options: ['True', 'False'],
            correctAnswer,
        });
    });

    it.each([['True'], ['False', 'True'], ['Yes', 'No'], ['True', 'False', 'Maybe']])(
        'rejects noncanonical true/false options: %j',
        (...options) => {
            expect(questionSchema.safeParse({ ...question, options }).success).toBe(false);
        },
    );

    it.each([-1, 2, 0.5, NaN, Infinity])('rejects invalid answer index %s', (correctAnswer) => {
        expect(questionSchema.safeParse({ ...question, correctAnswer }).success).toBe(false);
        expect(isValidAnswerIndex(correctAnswer, question.options)).toBe(false);
    });

    it('preserves multiple choice with variable numbers of answers', () => {
        for (const count of [2, 3, 4, 5, 6]) {
            const options = Array.from({ length: count }, (_, i) => `Choice ${i}`);
            expect(
                questionSchema.safeParse({
                    ...question,
                    format: 'MULTIPLE_CHOICE',
                    options,
                    correctAnswer: count - 1,
                }).success,
            ).toBe(true);
        }
        expect(questionSchema.safeParse({ ...question, format: 'SHORT_ANSWER' }).success).toBe(
            false,
        );
    });

    it('validates AI generated formats with the same option and answer rules', () => {
        expect(question_schema.parse(question)).toMatchObject({ format: 'TRUE_FALSE' });
        expect(question_schema.safeParse({ ...question, options: ['Yes', 'No'] }).success).toBe(
            false,
        );
        expect(question_schema.safeParse({ ...question, correctAnswer: 2 }).success).toBe(false);
        expect(
            question_schema.safeParse({
                ...question,
                format: 'MULTIPLE_CHOICE',
                options: ['One', 'Two', 'Three', 'Four'],
                correctAnswer: 3,
            }).success,
        ).toBe(true);
    });

    it('allows legacy option arrays without inferring a true/false format', () => {
        expect(hasValidQuestionOptions({ options: ['Yes', 'No'] })).toBe(true);
        expect(isValidAnswerIndex(1, ['True', 'False'])).toBe(true);
    });

    it.each([USER_TYPE.PARTICIPANT, USER_TYPE.SPECTATOR])(
        'hides the answer until results for %s, including reconnects',
        (role) => {
            const parsed = questionSchema.parse(question);
            for (const screen of ['QUESTION_READING', 'QUESTION_ACTIVE'] as const) {
                const visible = QuizAction.sanitizeCurrentQuestion(parsed, role, screen);
                expect(visible).toMatchObject({ format: 'TRUE_FALSE' });
                expect(visible).not.toHaveProperty('correctAnswer');
            }
            expect(
                QuizAction.sanitizeCurrentQuestion(parsed, role, 'QUESTION_RESULTS'),
            ).toMatchObject({ format: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 0 });
        },
    );
});
