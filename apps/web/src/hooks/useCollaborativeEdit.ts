import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useWebSocket } from './sockets/useWebSocket';
import { QuestionType } from '@nocturn/types';
import { useRef, useCallback } from 'react';

export function useCollaborativeEdit() {
    const { editQuestion } = useNewQuizStore();
    const { handleCollaboratorQuestionUpdate } = useWebSocket();
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

    return { editQuestionAndBroadcast };
}
