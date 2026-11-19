import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCollaborativeEdit } from '../../apps/web/src/hooks/useCollaborativeEdit';

const mocks = vi.hoisted(() => ({
    editQuestion: vi.fn(),
    updateQuiz: vi.fn(),
    sendQuestion: vi.fn(),
    sendQuiz: vi.fn(),
    cleanups: [],
}));
vi.mock('../../apps/web/node_modules/react', () => ({
    useRef: (value) => ({ current: value }),
    useCallback: (callback) => callback,
    useEffect: (effect) => {
        mocks.cleanups.push(effect());
    },
}));
vi.mock('@/store/new-quiz/useNewQuizStore', () => ({
    useNewQuizStore: () => ({ editQuestion: mocks.editQuestion, updateQuiz: mocks.updateQuiz }),
}));
vi.mock('../../apps/web/src/hooks/sockets/useWebSocket', () => ({
    useWebSocket: () => ({
        handleCollaboratorQuestionUpdate: mocks.sendQuestion,
        handleCollaboratorQuizUpdate: mocks.sendQuiz,
    }),
}));

describe('collaboration edit scheduling', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        mocks.cleanups = [];
    });
    afterEach(() => {
        mocks.cleanups.forEach((cleanup) => cleanup());
        vi.useRealTimers();
    });

    it('sends quick edits to different questions independently', () => {
        const edit = useCollaborativeEdit().editQuestionAndBroadcast;
        edit(3, { id: 'three', question: 'Three' }, { debounce: true });
        edit(5, { id: 'five', question: 'Five' }, { debounce: true });
        vi.advanceTimersByTime(1000);
        expect(mocks.sendQuestion.mock.calls).toEqual([
            [{ questionIndex: 3, question: { id: 'three', question: 'Three' } }],
            [{ questionIndex: 5, question: { id: 'five', question: 'Five' } }],
        ]);
    });

    it('keeps quiz and question fields in separate debounce scopes', () => {
        const { editQuestionAndBroadcast, updateQuizAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(0, { id: 'one', question: 'Changed' }, { debounce: true });
        updateQuizAndBroadcast({ title: 'Quiz' }, { debounce: true });
        vi.advanceTimersByTime(1000);
        expect(mocks.sendQuestion).toHaveBeenCalledOnce();
        expect(mocks.sendQuiz).toHaveBeenCalledWith({ title: 'Quiz' });
    });

    it('flushes edits when leaving the editor before the timer expires', () => {
        const { editQuestionAndBroadcast } = useCollaborativeEdit();
        editQuestionAndBroadcast(2, { id: 'two', question: 'Pending' }, { debounce: true });
        mocks.cleanups.forEach((cleanup) => cleanup());
        expect(mocks.sendQuestion).toHaveBeenCalledWith({
            questionIndex: 2,
            question: { id: 'two', question: 'Pending' },
        });
        vi.advanceTimersByTime(1000);
        expect(mocks.sendQuestion).toHaveBeenCalledOnce();
    });
});
