import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useWebSocket } from './sockets/useWebSocket';
import { QuestionType, QuizType } from '@nocturn/types';
import { useRef, useCallback, useEffect } from 'react';

export function useCollaborativeEdit() {
    const { editQuestion, updateQuiz } = useNewQuizStore();
    const { handleCollaboratorQuestionUpdate, handleCollaboratorQuizUpdate } = useWebSocket();
    const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Flush pending edits when switching away from an editor component.
    const pendingUpdates = useRef<Map<string, () => void>>(new Map());
    useEffect(() => {
        const timers = debounceTimers.current;
        const updates = pendingUpdates.current;
        return () => {
            timers.forEach(clearTimeout);
            updates.forEach((send) => send());
            timers.clear();
            updates.clear();
        };
    }, []);

    const editQuestionAndBroadcast = useCallback(
        (
            questionIndex: number,
            partialQuestion: Partial<QuestionType>,
            options?: { debounce?: boolean; debounceMs?: number },
        ) => {
            editQuestion(questionIndex, partialQuestion);

            const shouldDebounce = options?.debounce ?? false;
            const debounceMs = options?.debounceMs ?? 1000;

            if (shouldDebounce) {
                const field = `question:${partialQuestion.id || questionIndex}:${Object.keys(partialQuestion)
                    .filter((key) => key !== 'id')
                    .sort()
                    .join(',')}`;
                const timerId = debounceTimers.current.get(field);

                if (timerId) clearTimeout(timerId);

                const send = () => {
                    handleCollaboratorQuestionUpdate({
                        questionIndex,
                        question: partialQuestion,
                    });
                    debounceTimers.current.delete(field);
                    pendingUpdates.current.delete(field);
                };
                pendingUpdates.current.set(field, send);
                const newTimerId = setTimeout(send, debounceMs);

                debounceTimers.current.set(field, newTimerId);
            } else {
                handleCollaboratorQuestionUpdate({
                    questionIndex,
                    question: partialQuestion,
                });
            }
        },
        [editQuestion, handleCollaboratorQuestionUpdate],
    );

    const updateQuizAndBroadcast = useCallback(
        (quizPartial: Partial<QuizType>, options?: { debounce?: boolean; debounceMs?: number }) => {
            updateQuiz(quizPartial);

            const shouldDebounce = options?.debounce ?? false;
            const debounceMs = options?.debounceMs ?? 1000;

            if (shouldDebounce) {
                const field = `quiz:${Object.keys(quizPartial).sort().join(',')}`;
                const timerId = debounceTimers.current.get(field);

                if (timerId) clearTimeout(timerId);

                const send = () => {
                    handleCollaboratorQuizUpdate(quizPartial);
                    debounceTimers.current.delete(field);
                    pendingUpdates.current.delete(field);
                };
                pendingUpdates.current.set(field, send);
                const newTimerId = setTimeout(send, debounceMs);

                debounceTimers.current.set(field, newTimerId);
            } else {
                handleCollaboratorQuizUpdate(quizPartial);
            }
        },
        [updateQuiz, handleCollaboratorQuizUpdate],
    );

    return { editQuestionAndBroadcast, updateQuizAndBroadcast };
}
