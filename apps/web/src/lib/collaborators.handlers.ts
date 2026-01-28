import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';

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
}
