import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useWebSocket } from './sockets/useWebSocket';
import { QuestionType, QuizType } from '@nocturn/types';
import { useRef, useCallback } from 'react';

export function useCollaborativeEdit() {
    const { editQuestion, updateQuiz } = useNewQuizStore();
    const { handleCollaboratorQuestionUpdate, handleCollaboratorQuizUpdate } = useWebSocket();
    const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
                const field = Object.keys(partialQuestion)[0]!;
                const timerId = debounceTimers.current.get(field);

                if (timerId) clearTimeout(timerId);

                const newTimerId = setTimeout(() => {
                    handleCollaboratorQuestionUpdate({
                        questionIndex,
                        question: partialQuestion,
                    });
                    debounceTimers.current.delete(field);
                }, debounceMs);

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
                const field = Object.keys(quizPartial)[0]!;
                const timerId = debounceTimers.current.get(field);

                if (timerId) clearTimeout(timerId);

                const newTimerId = setTimeout(() => {
                    handleCollaboratorQuizUpdate(quizPartial);
                    debounceTimers.current.delete(field);
                }, debounceMs);

                debounceTimers.current.set(field, newTimerId);
            } else {
                handleCollaboratorQuizUpdate(quizPartial);
            }
        },
        [updateQuiz, handleCollaboratorQuizUpdate],
    );

    return { editQuestionAndBroadcast, updateQuizAndBroadcast };
}
