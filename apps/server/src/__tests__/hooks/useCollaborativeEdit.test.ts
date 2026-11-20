import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCollaborativeEdit } from '../../../../web/src/hooks/useCollaborativeEdit';

const mocks = vi.hoisted(() => ({
    editQuestion: vi.fn(),
    updateQuiz: vi.fn(),
    handleCollaboratorQuestionUpdate: vi.fn(),
    handleCollaboratorQuizUpdate: vi.fn(),
}));

// Exercise the hook's scheduling without mounting the editor or opening a socket.
vi.mock('../../../../web/node_modules/react', () => ({
    useRef: <T>(current: T) => ({ current }),
    useCallback: <T>(callback: T) => callback,
}));

vi.mock('@/store/new-quiz/useNewQuizStore', () => ({
    useNewQuizStore: () => mocks,
}));

vi.mock('../../../../web/src/hooks/sockets/useWebSocket', () => ({
    useWebSocket: () => mocks,
}));

describe('useCollaborativeEdit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it.each([
        [
            { options: ['First', 'Second'], id: 'q3' },
            { options: ['Third', 'Fourth'], id: 'q5' },
        ],
        [
            { question: 'Question 3', id: 'q3' },
            { question: 'Question 5', id: 'q5' },
        ],
        [
            { hint: 'Hint 3', id: 'q3' },
            { hint: 'Hint 5', id: 'q5' },
        ],
    ])('broadcasts quick edits to the same field on different questions', (first, second) => {
        const { editQuestionAndBroadcast } = useCollaborativeEdit();

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

    it('debounces repeated edits to the same question field with the requested delay', () => {
        const { editQuestionAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(2, { question: 'Draft' }, { debounce: true, debounceMs: 2000 });
        vi.advanceTimersByTime(500);
        editQuestionAndBroadcast(2, { question: 'Final' }, { debounce: true, debounceMs: 2000 });

        vi.advanceTimersByTime(1999);
        expect(mocks.handleCollaboratorQuestionUpdate).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(mocks.handleCollaboratorQuestionUpdate.mock.calls).toEqual([
            [{ questionIndex: 2, question: { question: 'Final' } }],
        ]);
    });

    it('keeps different fields and quiz updates independent', () => {
        const { editQuestionAndBroadcast, updateQuizAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(2, { question: 'Title' }, { debounce: true });
        editQuestionAndBroadcast(2, { explanation: 'Explanation' }, { debounce: true });
        editQuestionAndBroadcast(2, { imageUrl: 'question.png' }, { debounce: true });
        updateQuizAndBroadcast({ imageUrl: 'quiz.png' }, { debounce: true });

        vi.advanceTimersByTime(1000);
        expect(mocks.handleCollaboratorQuestionUpdate.mock.calls).toEqual([
            [{ questionIndex: 2, question: { question: 'Title' } }],
            [{ questionIndex: 2, question: { explanation: 'Explanation' } }],
            [{ questionIndex: 2, question: { imageUrl: 'question.png' } }],
        ]);
        expect(mocks.handleCollaboratorQuizUpdate).toHaveBeenCalledWith({ imageUrl: 'quiz.png' });
    });

    it('broadcasts edits immediately when debounce is disabled', () => {
        const { editQuestionAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(2, { correctAnswer: 1 });

        expect(mocks.editQuestion).toHaveBeenCalledWith(2, { correctAnswer: 1 });
        expect(mocks.handleCollaboratorQuestionUpdate).toHaveBeenCalledWith({
            questionIndex: 2,
            question: { correctAnswer: 1 },
        });
        expect(vi.getTimerCount()).toBe(0);
    });
});
