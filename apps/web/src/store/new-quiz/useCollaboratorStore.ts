import { Collaborator } from '@nocturn/types';
import { create } from 'zustand';

export interface PositionState {
    orderIndex: number;
    collaboratorName: string;
}

interface CollaboratorStore {
    collaborators: Collaborator[];
    collaboratorAtIndex: Map<string, PositionState>;
    updateCollaboratorAtIndex: (
        orderIndex: number,
        collaboratorId: Collaborator['id'],
        collaboratorName: string,
    ) => void;
    hasCollaborators: () => boolean;
    setCollaborators: (collaborators: Collaborator[]) => void;
    addCollaborator: (collaborator: Collaborator) => void;
    removeCollaborator: (collaboratorId: string) => void;
}

export const useCollaboratorStore = create<CollaboratorStore>((set, get) => ({
    collaborators: [],
    collaboratorAtIndex: new Map(),

    updateCollaboratorAtIndex: (orderIndex, collaboratorId, collaboratorName) => {
        const currentMap = get().collaboratorAtIndex;
        const newMap = new Map(currentMap);
        newMap.set(collaboratorId, { collaboratorName, orderIndex });

        set({
            collaboratorAtIndex: newMap,
        });
    },

    hasCollaborators: () => get().collaborators.length > 0,
    setCollaborators: (collaborators: Collaborator[]) => set({ collaborators }),
    addCollaborator: (collaborator: Collaborator) =>
        set({ collaborators: [...get().collaborators, collaborator] }),
    removeCollaborator: (collaboratorId: string) =>
        set({ collaborators: get().collaborators.filter((c) => c.id !== collaboratorId) }),
}));
