import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';

import {
    QuestionType,
    QuizType,
    QuestionEditBuffer,
    QuestionEditResult,
    mergeQuestionEdit,
} from '@nocturn/types';
import { toast } from '@/lib/toast';

export default class CollaboratorsHandlers {
    static handleIncomingQuestionTap(payload: unknown) {
        const { updateCollaboratorAtIndex } = useCollaboratorStore.getState();

        const data = payload as {
            orderIndex: number;
            collaboratorId: string;
            collaboratorName: string;
        };
        updateCollaboratorAtIndex(data.orderIndex, data.collaboratorId, data.collaboratorName);
    }

    private static questionEdits = new QuestionEditBuffer();
    private static sendEdit: ((payload: unknown) => boolean) | undefined;

    static hasPendingQuestionEdits(quizId: string) {
        return this.questionEdits.hasPending(quizId);
    }

    static sendQuestionEdit(
        base: QuestionType,
        changes: Partial<QuestionType>,
        send: (payload: unknown) => boolean,
    ) {
        this.sendEdit = send;
        const edit = {
            mutationId: crypto.randomUUID(),
            base: { ...base, quizId: useNewQuizStore.getState().quiz.id },
            changes,
        };
        this.questionEdits.send(edit, useNewQuizStore.getState().quiz.CollabSession?.id, send);
    }

    static handleIncomingQuestionUpdate(payload: unknown) {
        const data = payload as QuestionEditResult;
        if (!data.question) {
            toast.error(data.error || 'Question update failed. Reload before editing again.');
            return;
        }
        const { question, ownEdit } = CollaboratorsHandlers.questionEdits.receive(data);
        const { quiz, editQuestion } = useNewQuizStore.getState();
        const index = quiz.questions.findIndex((item) => item.id === question.id);
        if (index === -1) return;
        editQuestion(index, question);
        if (ownEdit && (data.error || data.conflicts.length)) {
            toast.warning(
                data.error ||
                    `Another editor changed ${data.conflicts.join(', ')}. Your edit was not applied.`,
                {
                    duration: Infinity,
                    // Goey uses a separate timer for expanded notifications.
                    timing: { displayDuration: 0 },
                    description: `Your edit: ${JSON.stringify(ownEdit.changes)}`,
                    action: {
                        label: 'Restore my edit',
                        onClick: () => {
                            const state = useNewQuizStore.getState();
                            const currentIndex = state.quiz.questions.findIndex(
                                (item) => item.id === question.id,
                            );
                            const base = state.quiz.questions[currentIndex];
                            const send = CollaboratorsHandlers.sendEdit;
                            if (!base || !send) return;
                            const changes = mergeQuestionEdit(base, ownEdit, false).question;
                            state.editQuestion(currentIndex, changes);
                            CollaboratorsHandlers.sendQuestionEdit(base, changes, send);
                        },
                    },
                },
            );
        }
    }

    static handleIncomingQuizUpdate(payload: unknown) {
        const { updateQuiz } = useNewQuizStore.getState();
        const data = payload as {
            quiz: Partial<QuizType>;
            collaboratorId: string;
            collaboratorName: string;
        };
        updateQuiz(data.quiz);
    }
}
