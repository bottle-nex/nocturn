import { Collaborator } from '@nocturn/types';
import { create } from 'zustand';

interface CollaboratorStore {
    collaborators: Collaborator[];
    hasCollaborators: () => boolean;
    setCollaborators: (collaborators: Collaborator[]) => void;
    addCollaborator: (collaborator: Collaborator) => void;
    removeCollaborator: (collaboratorId: string) => void;
}

export const useCollaboratorStore = create<CollaboratorStore>((set, get) => ({
    collaborators: [],
    hasCollaborators: () => get().collaborators.length > 0,
    setCollaborators: (collaborators: Collaborator[]) => set({ collaborators }),
    addCollaborator: (collaborator: Collaborator) =>
        set({ collaborators: [...get().collaborators, collaborator] }),
    removeCollaborator: (collaboratorId: string) =>
        set({ collaborators: get().collaborators.filter((c) => c.id !== collaboratorId) }),
}));
