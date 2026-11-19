import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    mergeQuestionEdit,
    QuestionEditBuffer,
    type QuestionEdit,
    type QuestionType,
} from '@nocturn/types';
import CollabStateCache from '../../cache/collab_state.cache';
import { createQuizSchema } from '../../schemas/createQuizSchema';

const redis = vi.hoisted(() => ({ hgetall: vi.fn(), eval: vi.fn(), pipeline: vi.fn() }));
vi.mock('ioredis', () => ({
    default: class {
        constructor() {
            return redis;
        }
    },
}));

const base: QuestionType = {
    id: 'question-1',
    quizId: 'quiz-1',
    question: 'Original question',
    options: ['One', 'Two', 'Three'],
    correctAnswer: 0,
    explanation: '',
    hint: '',
    difficulty: 1,
    basePoints: 100,
    timeLimit: 30,
    readingTime: 5,
    orderIndex: 0,
    isAsked: false,
    hintLaunched: false,
};
const edit = (
    changes: Partial<QuestionType>,
    mutationId = 'edit-1',
    original = base,
): QuestionEdit => ({ mutationId, base: original, changes });
const snapshot = (question: QuestionType) =>
    Object.fromEntries(
        Object.entries(question).map(([field, value]) => [field, JSON.stringify(value)]),
    );

describe('collaborative question merging', () => {
    it('keeps simultaneous changes to the question text and an answer option in either order', () => {
        const text = edit({ question: 'New question' });
        const option = edit({ options: ['One', 'New answer', 'Three'] });
        for (const [first, second] of [
            [text, option],
            [option, text],
        ]) {
            if (!first || !second) throw new Error('Missing test edit');
            const result = mergeQuestionEdit(mergeQuestionEdit(base, first).question, second);
            expect(result.conflicts).toEqual([]);
            expect(result.question).toMatchObject({
                question: 'New question',
                options: ['One', 'New answer', 'Three'],
            });
        }
    });

    it('merges changes to different answer options', () => {
        const current = mergeQuestionEdit(
            base,
            edit({ options: ['First', 'Two', 'Three'] }),
        ).question;
        expect(mergeQuestionEdit(current, edit({ options: ['One', 'Second', 'Three'] }))).toEqual({
            question: { ...base, options: ['First', 'Second', 'Three'] },
            conflicts: [],
        });
    });

    it('rejects the whole edit when text or the same answer option has changed', () => {
        const current = {
            ...base,
            question: 'Accepted text',
            options: ['Accepted option', 'Two', 'Three'],
        };
        for (const changes of [
            { question: 'Conflicting text', hint: 'Dependent hint' },
            { options: ['Conflicting option', 'Two', 'Three'] },
        ]) {
            const result = mergeQuestionEdit(current, edit(changes));
            expect(result.question).toEqual(current);
            expect(result.conflicts).toHaveLength(1);
        }
    });

    it('accepts identical concurrent changes and successive keystrokes', () => {
        const current = { ...base, question: 'New text' };
        expect(mergeQuestionEdit(current, edit({ question: 'New text' })).conflicts).toEqual([]);
        expect(
            mergeQuestionEdit(current, edit({ question: 'New text!' }, 'next', current)).question
                .question,
        ).toBe('New text!');
    });

    it('protects option positions and the correct answer during removal or reordering', () => {
        const current = { ...base, options: ['Changed', 'Two', 'Three'] };
        expect(
            mergeQuestionEdit(current, edit({ options: ['Two', 'One', 'Three'], correctAnswer: 1 }))
                .conflicts,
        ).toContain('options');
        const removed = { ...base, options: ['One', 'Three'] };
        expect(
            mergeQuestionEdit(removed, edit({ options: ['One', 'Typing', 'Three'] })).question,
        ).toEqual(removed);
        expect(mergeQuestionEdit(removed, edit({ correctAnswer: 1 })).conflicts).toContain(
            'options',
        );
    });

    it('preserves stable IDs through save validation', () => {
        expect(createQuizSchema.shape.questions.element.parse(base).id).toBe(base.id);
    });

    it('can explicitly restore option typing after a conflicting option removal', () => {
        const own = edit({ options: ['One', 'My answer', 'Three'] });
        const current = { ...base, options: ['One', 'Three'] };
        expect(mergeQuestionEdit(current, own).conflicts).toEqual(['options']);
        expect(mergeQuestionEdit(current, own, false).question.options).toEqual(
            own.changes.options,
        );
    });
});

describe('optimistic question acknowledgements', () => {
    it('keeps newer local keystrokes until their acknowledgement', () => {
        const buffer = new QuestionEditBuffer();
        const first = edit({ question: 'A' });
        const second = edit({ question: 'AB' }, 'edit-2', { ...base, question: 'A' });
        buffer.add(first);
        buffer.add(second);
        expect(buffer.hasPending(base.quizId)).toBe(true);
        const acknowledged = buffer.receive({
            mutationId: first.mutationId,
            question: { ...base, question: 'A' },
            conflicts: [],
        });
        expect(acknowledged.question.question).toBe('AB');
        expect(
            buffer.receive({
                mutationId: second.mutationId,
                question: { ...base, question: 'AB' },
                conflicts: [],
            }).question.question,
        ).toBe('AB');
        expect(buffer.hasPending(base.quizId)).toBe(false);
    });

    it('keeps local option typing over a remote update to another option', () => {
        const buffer = new QuestionEditBuffer();
        buffer.add(edit({ options: ['Local', 'Two', 'Three'] }));
        expect(
            buffer.receive({
                mutationId: 'remote',
                question: { ...base, options: ['One', 'Remote', 'Three'] },
                conflicts: [],
            }).question.options,
        ).toEqual(['Local', 'Remote', 'Three']);
    });

    it('returns a rejected edit for recovery while adopting the accepted value', () => {
        const buffer = new QuestionEditBuffer();
        const own = edit({ question: 'My version' });
        buffer.add(own);
        const result = buffer.receive({
            mutationId: own.mutationId,
            question: { ...base, question: 'Their version' },
            conflicts: ['question'],
        });
        expect(result.question.question).toBe('Their version');
        expect(result.ownEdit).toEqual(own);
        expect(mergeQuestionEdit(result.question, own, false).question.question).toBe('My version');
    });

    it('matches questions by ID even when another question has the same position', () => {
        const buffer = new QuestionEditBuffer();
        buffer.add(edit({ question: 'Local' }));
        expect(
            buffer.receive({
                mutationId: 'remote',
                question: { ...base, id: 'question-2' },
                conflicts: [],
            }).question.question,
        ).toBe(base.question);
    });
});

describe('atomic collaboration cache writes', () => {
    beforeEach(() => vi.clearAllMocks());

    it('rechecks the original base after a competing Redis write and publishes the conflict to all editors', async () => {
        const cache = new CollabStateCache();
        redis.hgetall
            .mockResolvedValueOnce(snapshot(base))
            .mockResolvedValueOnce(snapshot({ ...base, question: 'Accepted' }));
        redis.eval.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
        await cache.update_question_state(
            'session',
            base.quizId,
            edit({ question: 'Conflicting' }),
        );
        expect(redis.eval).toHaveBeenCalledTimes(2);
        const args = redis.eval.mock.calls[1];
        expect(args?.[5]).toBe('collab_session:session');
        expect(JSON.parse(args?.[6])).toEqual({
            type: 'QUESTION_UPDATE',
            payload: {
                mutationId: 'edit-1',
                question: { ...base, question: 'Accepted' },
                conflicts: ['question'],
            },
        });
    });

    it('merges an unrelated write rather than rejecting it after Redis contention', async () => {
        const cache = new CollabStateCache();
        redis.hgetall
            .mockResolvedValueOnce(snapshot(base))
            .mockResolvedValueOnce(snapshot({ ...base, hint: 'Remote hint' }));
        redis.eval.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
        await cache.update_question_state('session', base.quizId, edit({ question: 'Local text' }));
        expect(JSON.parse(redis.eval.mock.calls[1]?.[6]).payload).toMatchObject({
            question: { question: 'Local text', hint: 'Remote hint' },
            conflicts: [],
        });
    });

    it('does not replace existing live question fields when another collaborator connects', async () => {
        const pipeline = {
            hset: vi.fn(),
            hsetnx: vi.fn(),
            expire: vi.fn(),
            exec: vi.fn().mockResolvedValue([]),
        };
        redis.pipeline.mockReturnValue(pipeline);
        await new CollabStateCache().set_quiz_and_questions_state('session', base.quizId, {
            questions: [base],
        });
        expect(pipeline.hset).not.toHaveBeenCalled();
        expect(pipeline.hsetnx).toHaveBeenCalledWith(
            'collab:session:quiz:quiz-1:question:question-1',
            'question',
            JSON.stringify(base.question),
        );
    });

    it('propagates Redis errors so the caller can report an unsaved edit', async () => {
        redis.hgetall.mockRejectedValueOnce(new Error('Redis unavailable'));
        await expect(
            new CollabStateCache().update_question_state(
                'session',
                base.quizId,
                edit({ hint: 'Unsaved' }),
            ),
        ).rejects.toThrow('Redis unavailable');
    });
});
