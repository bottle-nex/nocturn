import { QuizType, QuizViewsType } from '@nocturn/types';
import { create } from 'zustand';

interface RecentlyViewedQuizStoreData {
    quiz: QuizType[];
    recentlyViewed: QuizViewsType[];

    setQuizs: (quizs: QuizType[]) => void;
    setRecentlyViewed: (recentlyViewed: QuizViewsType[]) => void;

    deleteQuiz: (quizId: string) => void;
}

export const useRecentlyViewedQuizStore = create<RecentlyViewedQuizStoreData>((set) => ({
    quiz: [],
    recentlyViewed: [],

    setQuizs: (quiz) => set({ quiz }),
    setRecentlyViewed: (recentlyViewed) => set({ recentlyViewed }),

    deleteQuiz: (quizId) =>
        set((state) => ({
            quiz: state.quiz.filter((q) => q.id !== quizId),
            recentlyViewed: state.recentlyViewed.filter((rv) => rv.quiz?.id !== quizId),
        })),
}));
