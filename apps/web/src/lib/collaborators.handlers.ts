import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';

export default class CollaboratorsHandlers {
    static handleIncomingQuestionTap(payload: unknown) {
        console.log('Question tap received:', payload);
        const { updateCollaboratorAtIndex } = useCollaboratorStore.getState();
        const data = payload as { orderIndex: number; collaboratorId: string };
        updateCollaboratorAtIndex(data.orderIndex, data.collaboratorId);
    }
}
