import { QuestionType, QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface LiveSecondQuizStore {
    secondQuiz: QuizType;
    secondCurrentQuestion: QuestionType | null;

    updateSecondQuiz: (quiz: QuizType) => void;
    updateSecondCurrentQuestion: (question: QuestionType) => void;
}

export const useLiveSecondQuizStore = create<LiveSecondQuizStore>((set) => ({
    secondQuiz: {} as QuizType,
    secondCurrentQuestion: null,

    updateSecondQuiz: (updatedFields: Partial<QuizType>) => {
        set((state) => {
            const updatedQuiz: QuizType = { ...state.secondQuiz, ...updatedFields };
            let currentQuestion: QuestionType | null = state.secondCurrentQuestion;

            if (updatedFields.questions?.length && !state.secondCurrentQuestion) {
                const questions = updatedFields.questions as QuestionType[];
                const firstAvailable =
                    questions
                        .filter((q) => q && !q.isAsked)
                        .sort((a, b) => (a?.orderIndex || 0) - (b?.orderIndex || 0))[0] ?? null;
                currentQuestion = firstAvailable ?? questions[0] ?? null;
            }

            return { secondQuiz: updatedQuiz, secondCurrentQuestion: currentQuestion };
        });
    },
    updateSecondCurrentQuestion: (updateFields) =>
        set((state) => {
            const current = state.secondCurrentQuestion;

            if (!updateFields) return { currentQuestion: current };

            if (updateFields.id !== undefined && updateFields.question !== undefined) {
                return { currentQuestion: updateFields as QuestionType };
            }

            if (current) {
                return { currentQuestion: { ...current, ...updateFields } as QuestionType };
            }

            if (updateFields.id !== undefined) {
                return { currentQuestion: updateFields as QuestionType };
            }

            return { secondCurrentQuestion: null };
        }),
}));
