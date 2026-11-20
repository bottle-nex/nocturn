import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuestionType, QuizType } from '@nocturn/types';

const mocks = vi.hoisted(() => ({
    editQuestion: vi.fn(),
    updateQuiz: vi.fn(),
    handleCollaboratorQuestionUpdate: vi.fn(),
    handleCollaboratorQuizUpdate: vi.fn(),
}));

// Exercise the hook without mounting the editor or opening a socket.
vi.mock('../../../../web/node_modules/react', () => ({
    useRef: (value: unknown) => ({ current: value }),
    useCallback: (callback: unknown) => callback,
}));
vi.mock('@/store/new-quiz/useNewQuizStore', () => ({ useNewQuizStore: () => mocks }));
vi.mock('../../../../web/src/hooks/sockets/useWebSocket', () => ({ useWebSocket: () => mocks }));

type DebounceOptions = { debounce?: boolean; debounceMs?: number };

// Load the web hook through Vitest so its browser dependencies can be mocked
// without pulling the web application's aliases into the server's type check.
const { useCollaborativeEdit } = await vi.importActual<{
    useCollaborativeEdit: () => {
        editQuestionAndBroadcast: (
            index: number,
            question: Partial<QuestionType>,
            options?: DebounceOptions,
        ) => void;
        updateQuizAndBroadcast: (quiz: Partial<QuizType>, options?: DebounceOptions) => void;
    };
}>('../../../../web/src/hooks/useCollaborativeEdit');

describe('collaborative edit debouncing', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it.each([
        { options: ['First', 'Second'] },
        { question: 'Updated title' },
        { hint: 'Updated hint' },
    ])('broadcasts the same field on two questions independently: %j', (patch) => {
        const { editQuestionAndBroadcast } = useCollaborativeEdit();
        const first = { ...patch, id: 'question-3' };
        const second = { ...patch, id: 'question-5' };

        editQuestionAndBroadcast(2, first, { debounce: true });
        vi.advanceTimersByTime(500);
        editQuestionAndBroadcast(4, second, { debounce: true });

        expect(mocks.editQuestion.mock.calls).toEqual([
            [2, first],
            [4, second],
        ]);
        expect(mocks.handleCollaboratorQuestionUpdate).not.toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        expect(mocks.handleCollaboratorQuestionUpdate.mock.calls).toEqual([
            [{ questionIndex: 2, question: first }],
        ]);
        vi.advanceTimersByTime(500);
        expect(mocks.handleCollaboratorQuestionUpdate.mock.calls).toEqual([
            [{ questionIndex: 2, question: first }],
            [{ questionIndex: 4, question: second }],
        ]);
    });

    it('only broadcasts the latest edit to the same question field', () => {
        const { editQuestionAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(2, { question: 'Old' }, { debounce: true });
        vi.advanceTimersByTime(500);
        editQuestionAndBroadcast(2, { question: 'Latest' }, { debounce: true });
        vi.advanceTimersByTime(500);
        expect(mocks.handleCollaboratorQuestionUpdate).not.toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        expect(mocks.handleCollaboratorQuestionUpdate.mock.calls).toEqual([
            [{ questionIndex: 2, question: { question: 'Latest' } }],
        ]);
    });

    it('keeps different fields and quiz edits independent', () => {
        const { editQuestionAndBroadcast, updateQuizAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(2, { question: 'Title' }, { debounce: true });
        editQuestionAndBroadcast(2, { id: 'question-3' }, { debounce: true });
        updateQuizAndBroadcast({ id: 'quiz-id' }, { debounce: true });
        vi.advanceTimersByTime(1000);
        expect(mocks.handleCollaboratorQuestionUpdate.mock.calls).toEqual([
            [{ questionIndex: 2, question: { question: 'Title' } }],
            [{ questionIndex: 2, question: { id: 'question-3' } }],
        ]);
        expect(mocks.handleCollaboratorQuizUpdate).toHaveBeenCalledExactlyOnceWith({
            id: 'quiz-id',
        });
    });

    it('broadcasts edits immediately when debouncing is disabled', () => {
        const { editQuestionAndBroadcast, updateQuizAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(2, { question: 'Title' });
        updateQuizAndBroadcast({ title: 'Quiz title' });
        expect(mocks.handleCollaboratorQuestionUpdate).toHaveBeenCalledExactlyOnceWith({
            questionIndex: 2,
            question: { question: 'Title' },
        });
        expect(mocks.handleCollaboratorQuizUpdate).toHaveBeenCalledExactlyOnceWith({
            title: 'Quiz title',
        });
        expect(vi.getTimerCount()).toBe(0);
    });
});
