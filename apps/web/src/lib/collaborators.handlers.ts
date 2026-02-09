import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';

import { QuestionType, QuizType } from '@nocturn/types';

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

    static handleIncomingQuestionUpdate(payload: unknown) {
        const { editQuestion } = useNewQuizStore.getState();
        const data = payload as {
            questionIndex: number;
            question: Partial<QuestionType>;
            collaboratorId: string;
            collaboratorName: string;
        };
        editQuestion(data.questionIndex, data.question);
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
