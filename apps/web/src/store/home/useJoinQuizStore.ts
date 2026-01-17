import { create } from 'zustand';

interface JoinQuizButtonStore {
    showJoinInput: boolean;
    toggleJoinInput: () => void;
}

export const useJoinQuizStore = create<JoinQuizButtonStore>((set) => ({
    showJoinInput: false,
    toggleJoinInput: () => set((state) => ({ showJoinInput: !state.showJoinInput })),
}));
