import { describe, expect, it } from 'vitest';
import { mergeQuestionEdit, type QuestionEdit, type QuestionType } from '@nocturn/types';
import { broadcastQuestionPoints } from '../../../../web/src/lib/question-point-edits';

const question: QuestionType = {
    id: 'question-1',
    quizId: 'quiz-1',
    question: 'Question',
    options: ['One', 'Two'],
    correctAnswer: 0,
    difficulty: 1,
    basePoints: 100,
    timeLimit: 30,
    readingTime: 5,
    orderIndex: 0,
    isAsked: false,
    hintLaunched: false,
};

describe('broadcasting question points', () => {
    it.each([
        ['linear', [200, 400]],
        ['stepped', [100, 200]],
        ['manual', [150, 250]],
        ['disabled multiplier', [100, 100]],
    ])(
        'captures the original points for %s controls before applying local edits',
        (_mode, points) => {
            const original = [
                question,
                { ...question, id: 'question-2', orderIndex: 1, basePoints: 300 },
            ];
            const local = [...original];
            const edits: QuestionEdit[] = [];
            broadcastQuestionPoints(local, points, (index, changes) => {
                const base = local[index];
                if (!base) throw new Error('Missing question');
                edits.push({ mutationId: `edit-${index}`, base, changes });
                local[index] = { ...base, ...changes };
            });
            const accepted = original.map((base) => {
                const edit = edits.find((item) => item.base.id === base.id);
                if (!edit) return base;
                const result = mergeQuestionEdit(base, edit);
                expect(result.conflicts).toEqual([]);
                return result.question;
            });
            expect(accepted.map((item) => item.basePoints)).toEqual(points);
            expect(edits.every((edit) => edit.base.basePoints !== edit.changes.basePoints)).toBe(
                true,
            );
        },
    );

    it('preserves another editor’s question text while accepting a point update', () => {
        broadcastQuestionPoints([question], [200], (_index, changes) => {
            const result = mergeQuestionEdit(
                { ...question, question: 'Remote text' },
                {
                    mutationId: 'point-edit',
                    base: question,
                    changes,
                },
            );
            expect(result.question).toMatchObject({ question: 'Remote text', basePoints: 200 });
            expect(result.conflicts).toEqual([]);
        });
    });
});
