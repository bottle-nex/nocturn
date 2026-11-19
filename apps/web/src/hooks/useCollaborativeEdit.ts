import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useWebSocket } from './sockets/useWebSocket';
import { QuestionType, QuizType } from '@nocturn/types';
import { useRef, useCallback } from 'react';
import CollaboratorsHandlers from '@/lib/collaborators.handlers';
import { broadcastQuestionPoints } from '@/lib/question-point-edits';

export function useCollaborativeEdit() {
    const { editQuestion, updateQuiz } = useNewQuizStore();
    const { handleCollaboratorQuestionUpdate, handleCollaboratorQuizUpdate } = useWebSocket();
    const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const editQuestionAndBroadcast = useCallback(
        (
            questionIndex: number,
            partialQuestion: Partial<QuestionType>,
            _options?: { debounce?: boolean; debounceMs?: number },
        ) => {
            const base = useNewQuizStore.getState().quiz.questions[questionIndex];
            if (!base) return;
            editQuestion(questionIndex, { ...partialQuestion, id: base.id });
            // Send each edit with the values it was made against. Delaying a patch
            // lets remote changes erase the user's unbroadcast keystrokes.
            CollaboratorsHandlers.sendQuestionEdit(
                base,
                partialQuestion,
                handleCollaboratorQuestionUpdate,
            );
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

    const updateQuestionPointsAndBroadcast = useCallback(
        (points: number[]) => {
            broadcastQuestionPoints(
                useNewQuizStore.getState().quiz.questions,
                points,
                editQuestionAndBroadcast,
            );
        },
        [editQuestionAndBroadcast],
    );

    return { editQuestionAndBroadcast, updateQuizAndBroadcast, updateQuestionPointsAndBroadcast };
}
