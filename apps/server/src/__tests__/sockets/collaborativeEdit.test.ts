import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from '../../../../web/node_modules/react';
import { renderToStaticMarkup } from '../../../../web/node_modules/react-dom/server';

const mocks = vi.hoisted(() => ({
    editQuestion: vi.fn(),
    updateQuiz: vi.fn(),
    questionUpdate: vi.fn(),
    quizUpdate: vi.fn(),
}));
vi.mock('@/store/new-quiz/useNewQuizStore', () => ({ useNewQuizStore: () => mocks }));
vi.mock('../../../../web/src/hooks/sockets/useWebSocket', () => ({
    useWebSocket: () => ({
        handleCollaboratorQuestionUpdate: mocks.questionUpdate,
        handleCollaboratorQuizUpdate: mocks.quizUpdate,
    }),
}));
import { useCollaborativeEdit } from '../../../../web/src/hooks/useCollaborativeEdit';

describe('useCollaborativeEdit', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('broadcasts debounced changes to the same field on different questions', () => {
        vi.useFakeTimers();
        function Editor() {
            const { editQuestionAndBroadcast } = useCollaborativeEdit();
            editQuestionAndBroadcast(2, { explanation: 'first' }, { debounce: true });
            editQuestionAndBroadcast(4, { explanation: 'second' }, { debounce: true });
            return null;
        }
        renderToStaticMarkup(createElement(Editor));
        vi.advanceTimersByTime(1000);
        expect(mocks.questionUpdate.mock.calls).toEqual([
            [{ questionIndex: 2, question: { explanation: 'first' } }],
            [{ questionIndex: 4, question: { explanation: 'second' } }],
        ]);
    });
});
