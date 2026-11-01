import { toJsonSchema } from '@langchain/core/utils/json_schema';
import { describe, expect, it } from 'vitest';
import {
    answerCredit,
    canonicalQuestion,
    correctAnswerLabel,
    publicQuestion,
    questionProblem,
    QuestionDefinition,
} from '@nocturn/types';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { executor_schema, question_schema } from '../../gen/schemas/createNewQuizSchema';

const choice: QuestionDefinition = { options: ['A', 'B', 'C', 'D'], correctAnswer: 1 };
describe('question answers', () => {
    it('exports an AI structured-output schema', () => {
        expect(() => toJsonSchema(executor_schema)).not.toThrow();
    });
    it('preserves single-choice quizzes and rejects invalid indices', () => {
        expect(answerCredit(choice, 1)).toBe(1);
        expect(answerCredit(choice, 0)).toBe(0);
        for (const invalid of [-1, 4, 1.5, '1', [], NaN, Infinity, null])
            expect(answerCredit(choice, invalid)).toBeNull();
    });
    it('uses two fixed true/false answers', () => {
        const q = { ...choice, questionType: 'TRUE_FALSE', options: ['True', 'False'] };
        expect(questionProblem(q)).toBeNull();
        expect(answerCredit(q, 1)).toBe(1);
        expect(questionProblem({ ...q, options: ['Yes', 'No'] })).toBeTruthy();
    });
    it('requires the exact set, independently of selection order', () => {
        const q = {
            ...choice,
            questionType: 'MULTI_SELECT',
            answerConfig: { correctIndices: [0, 2] },
        };
        expect(answerCredit(q, [2, 0])).toBe(1);
        for (const answer of [[0], [0, 1, 2], [1, 3]]) expect(answerCredit(q, answer)).toBe(0);
        for (const answer of [[0, 0], [], [4], ['0'], 0])
            expect(answerCredit(q, answer)).toBeNull();
    });
    it('normalizes case and whitespace in all accepted typed answers', () => {
        const q = {
            ...choice,
            questionType: 'SHORT_ANSWER',
            options: [],
            answerConfig: { acceptedAnswers: ['New York', 'NYC'] },
        };
        expect(answerCredit(q, '  NEW   york  ')).toBe(1);
        expect(answerCredit(q, 'nyc')).toBe(1);
        expect(answerCredit(q, 'York')).toBe(0);
        expect(answerCredit(q, 1)).toBeNull();
        expect(answerCredit(q, 'x'.repeat(201))).toBeNull();
    });
    it('awards ordering credit per position and requires a complete permutation', () => {
        const q = {
            ...choice,
            questionType: 'ORDERING',
            answerConfig: { correctOrder: [2, 0, 3, 1] },
        };
        expect(answerCredit(q, [2, 0, 3, 1])).toBe(1);
        expect(answerCredit(q, [2, 0, 1, 3])).toBe(0.5);
        expect(answerCredit(q, [0, 2, 1, 3])).toBe(0);
        expect(answerCredit(q, [2, 0])).toBeNull();
        expect(answerCredit(q, [2, 0, 0, 1])).toBeNull();
    });
    it('scales numeric credit with distance, clamps to zero, and rejects out-of-range values', () => {
        const q = {
            ...choice,
            questionType: 'NUMERIC',
            options: [],
            answerConfig: { min: -10, max: 30, target: 10, tolerance: 10 },
        };
        expect(answerCredit(q, 10)).toBe(1);
        expect(answerCredit(q, 7.5)).toBe(0.75);
        expect(answerCredit(q, 12.5)).toBe(0.75);
        expect(answerCredit(q, -10)).toBe(0);
        expect(answerCredit(q, 30)).toBe(0);
        for (const answer of [-11, 31, NaN, Infinity, '10'])
            expect(answerCredit(q, answer)).toBeNull();
        expect(
            questionProblem({ ...q, answerConfig: { min: 20, max: 10, target: 15, tolerance: 5 } }),
        ).toBeTruthy();
    });
    it('never sends answer keys before results, including to hosts', () => {
        for (const q of [
            choice,
            {
                ...choice,
                questionType: 'SHORT_ANSWER',
                answerConfig: { acceptedAnswers: ['secret'] },
            },
            { ...choice, questionType: 'ORDERING', answerConfig: { correctOrder: [2, 0, 3, 1] } },
        ]) {
            const result = publicQuestion({ ...q, explanation: 'secret explanation' });
            expect(result).not.toHaveProperty('correctAnswer');
            expect(result).not.toHaveProperty('explanation');
            expect(result.answerConfig).toEqual({});
        }
        expect(
            publicQuestion({
                ...choice,
                questionType: 'NUMERIC',
                answerConfig: { min: 0, max: 100, target: 42, tolerance: 20 },
            }).answerConfig,
        ).toEqual({ min: 0, max: 100 });
    });
    it('canonicalizes ordering options without changing the right answer', () => {
        const q = {
            ...choice,
            options: ['Z', 'A', 'M', 'B'],
            questionType: 'ORDERING',
            answerConfig: { correctOrder: [1, 2, 3, 0] },
        };
        const sorted = canonicalQuestion(q);
        expect(sorted.options).toEqual(['A', 'B', 'M', 'Z']);
        expect(correctAnswerLabel(sorted)).toBe(correctAnswerLabel(q));
        expect(answerCredit(sorted, [0, 2, 1, 3])).toBe(1);
    });
    it('validates the same definitions in the editor and AI generation', () => {
        const q = {
            question: 'Pick the primes',
            options: ['2', '3', '4'],
            correctAnswer: 0,
            questionType: 'MULTI_SELECT',
            answerConfig: { correctIndices: [0, 1] },
            explanation: 'Prime numbers',
            hint: 'Divisors',
            difficulty: 1,
            basePoints: 100,
            timeLimit: 30,
            readingTime: 7,
            orderIndex: 0,
            hintLaunched: false,
        };
        expect(createQuizSchema.safeParse({ title: 'Quiz', questions: [q] }).success).toBe(true);
        expect(question_schema.safeParse(q).success).toBe(true);
        expect(
            question_schema.safeParse({ ...q, answerConfig: { correctIndices: [5] } }).success,
        ).toBe(false);
        expect(
            createQuizSchema.safeParse({
                title: 'Quiz',
                questions: [{ ...q, answerConfig: { correctIndices: [] } }],
            }).success,
        ).toBe(false);
    });
});
