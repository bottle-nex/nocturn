import { Collaborator } from '@nocturn/types';
import { create } from 'zustand';

interface CollaboratorAtIndex {
    orderIndex: number;
    collaborator: Collaborator;
}

interface CollaboratorStore {
    collaborators: Collaborator[];
    collaboratorAtIndex: CollaboratorAtIndex | null;
    updateCollaboratorAtIndex: (orderIndex: number, collaboratorId: Collaborator['id']) => void;
    hasCollaborators: () => boolean;
    setCollaborators: (collaborators: Collaborator[]) => void;
    addCollaborator: (collaborator: Collaborator) => void;
    removeCollaborator: (collaboratorId: string) => void;
}

export const useCollaboratorStore = create<CollaboratorStore>((set, get) => ({
    collaborators: [],
    collaboratorAtIndex: null,
    updateCollaboratorAtIndex: (orderIndex: number, collaboratorId: Collaborator['id']) => {
        const collaborator = get().collaborators.find((c) => c.id === collaboratorId) || null;
        if (collaborator) {
            set({ collaboratorAtIndex: { orderIndex, collaborator } });
        }
    },
    hasCollaborators: () => get().collaborators.length > 0,
    setCollaborators: (collaborators: Collaborator[]) => set({ collaborators }),
    addCollaborator: (collaborator: Collaborator) =>
        set({ collaborators: [...get().collaborators, collaborator] }),
    removeCollaborator: (collaboratorId: string) =>
        set({ collaborators: get().collaborators.filter((c) => c.id !== collaboratorId) }),
}));
