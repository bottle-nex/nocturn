import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { QuestionType } from 'node_modules/@nocturn/types/src/prisma/schemas.prisma';

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
}
