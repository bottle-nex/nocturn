import { QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface FavouriteQuizStoreData {
    favouriteQuizs: QuizType[];
    setFavouriteQuizzes: (favouriteQuizzes: QuizType[]) => void;

    addFavouriteQuiz: (favouriteQuiz: QuizType) => void;
    deleteFavouriteQuiz: (favouriteQuizId: string) => void;
}

export const useFavouriteQuizStore = create<FavouriteQuizStoreData>((set) => ({
    favouriteQuizs: [],
    addFavouriteQuiz: (favouriteQuiz) =>
        set((state) => ({ favouriteQuizs: [...state.favouriteQuizs, favouriteQuiz] })),
    setFavouriteQuizzes: (favouriteQuizs) => set({ favouriteQuizs }),
    deleteFavouriteQuiz: (favouriteQuizId: string) => {
        set((state) => ({
            favouriteQuizs: state.favouriteQuizs.filter((fq) => fq.id !== favouriteQuizId),
        }));
    },
}));
