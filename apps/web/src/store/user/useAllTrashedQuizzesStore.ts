import { TrashedQuizWithDaysLedt } from '@/lib/backend/home/quiz-actions';
import { create } from 'zustand';

interface AllQuizsStoreType {
    trashedQuizzes: TrashedQuizWithDaysLedt[];
    setAllTrashedQuizzes: (quizs: TrashedQuizWithDaysLedt[]) => void;
    removeTrashedQuizById: (quizId: string) => void;
    resetTrashQuizStore: () => void;
}

export const useAllTrashedQuizzesStore = create<AllQuizsStoreType>((set) => ({
    trashedQuizzes: [],
    setAllTrashedQuizzes: (trashedQuizzes) => set({ trashedQuizzes }),
    removeTrashedQuizById: (quizId) =>
        set((state) => ({
            trashedQuizzes: state.trashedQuizzes.filter((q) => q.id !== quizId),
        })),
    resetTrashQuizStore: () => set({ trashedQuizzes: [] }),
}));
