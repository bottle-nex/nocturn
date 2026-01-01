import { QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface AllQuizsStoreType {
    quizs: QuizType[];
    setAllQuizs: (quizs: QuizType[]) => void;
    updateQuiz: (quizId: string, quiz: Partial<QuizType>) => void;
    deleteQuiz: (quizId: string) => void;
}

export const useAllQuizsStore = create<AllQuizsStoreType>((set) => ({
    quizs: [],
    setAllQuizs: (quizs) => set({ quizs }),
    updateQuiz: (quizId, quiz: Partial<QuizType>) => {
        set((state) => ({
            quizs: state.quizs.map((q) => (q.id === quizId ? { ...q, ...quiz } : q)),
        }));
    },
    deleteQuiz: (quizId) => {
        set((state) => ({
            quizs: state.quizs.filter((q) => q.id != quizId),
        }));
    },
}));
