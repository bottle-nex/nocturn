import { GameSessionType, QuestionType, QuizType } from '@/types/prisma-types';
import { create } from 'zustand';

interface LiveQuizStore {
    quiz: QuizType;
    updateQuiz: (updatedFields: Partial<QuizType>) => void;
    gameSession: GameSessionType | null;
    updateGameSession: (updatedFields: Partial<GameSessionType>) => void;
    currentQuestion: QuestionType | null | undefined;
    updateCurrentQuestion: (updatedFields: Partial<QuestionType>) => void;
    nextQuestion: QuestionType | null | undefined;
    updateNextQuestion: (updateFields: Partial<QuestionType>) => void;
    alreadyResponded: boolean;
    setAlreadyResponded: (value: boolean) => void;

    // lifelines
    lifelineRequested: boolean;
    setLifelineRequested: (requested: boolean, expiresAt?: number) => void;

    lifelineExpiresAt: number | null;

    lifelineResult: {
        mostPopularOption: number | null;
        totalResponses: number;
        wasSuccessful: boolean;
        optionBreakdown: { [key: number]: number };
    } | null;
    setLifelineResult: (result: {
        mostPopularOption: number | null;
        totalResponses: number;
        wasSuccessful: boolean;
        optionBreakdown: { [key: number]: number };
    }) => void;

    activeLifelineSession: {
        questionId: string;
        expiresAt: number;
        participantCount: number;
        isActive: boolean;
    } | null;
    setActiveLifelineSession: (
        session: {
            questionId: string;
            expiresAt: number;
            participantCount: number;
            isActive: boolean;
        } | null,
    ) => void;

    hasUsedLifeline: boolean;
    setHasUsedLifeline: (used: boolean) => void;

    resetQuestionLifelineState: () => void;
    clearLifelineData: () => void;
}

export const useLiveQuizStore = create<LiveQuizStore>((set) => ({
    quiz: {} as QuizType,
    updateQuiz: (updatedFields: Partial<QuizType>) => {
        set((state) => {
            const updatedQuiz = {
                ...state.quiz,
                ...updatedFields,
            } as QuizType;
            let currentQuestion = state.currentQuestion;
            if (
                updatedFields.questions &&
                updatedFields.questions.length > 0 &&
                !state.currentQuestion
            ) {
                // Find the first non-asked question
                const firstAvailableQuestion = updatedFields.questions
                    .filter((q) => q && !q.isAsked)
                    .sort((a, b) => (a?.orderIndex || 0) - (b?.orderIndex || 0))[0];
                currentQuestion = firstAvailableQuestion ?? updatedFields.questions[0];
            }
            return {
                quiz: updatedQuiz,
                currentQuestion,
            };
        });
    },
    gameSession: null,
    updateGameSession: (updatedFields: Partial<GameSessionType>) => {
        set((state) => ({
            gameSession: {
                ...state.gameSession,
                ...updatedFields,
            } as GameSessionType,
        }));
    },
    currentQuestion: null,
    updateCurrentQuestion: (updateFields: Partial<QuestionType>) => {
        set((state) => {
            // If we're passing a complete question object, replace entirely
            if (updateFields && updateFields.question) {
                return {
                    currentQuestion: updateFields as QuestionType,
                };
            }
            // Otherwise, merge with existing
            return {
                currentQuestion: {
                    ...state.currentQuestion,
                    ...updateFields,
                } as QuestionType,
            };
        });
    },
    nextQuestion: null,
    updateNextQuestion: (updateFields: Partial<QuestionType>) => {
        set((state) => {
            if (updateFields.id && updateFields.question) {
                return {
                    nextQuestion: updateFields as QuestionType,
                };
            }
            return {
                nextQuestion: {
                    ...state.nextQuestion,
                    ...updateFields,
                } as QuestionType,
            };
        });
    },
    alreadyResponded: false,
    setAlreadyResponded: (value: boolean) => set({ alreadyResponded: value }),

    lifelineRequested: false,
    setLifelineRequested: (requested: boolean, expiresAt?: number) =>
        set({
            lifelineRequested: requested,
            lifelineExpiresAt: expiresAt || null,
        }),

    lifelineExpiresAt: null,

    lifelineResult: null,
    setLifelineResult: (result: {
        mostPopularOption: number | null;
        totalResponses: number;
        wasSuccessful: boolean;
        optionBreakdown: { [key: number]: number };
    }) =>
        set({
            lifelineResult: result,
            lifelineRequested: false,
        }),

    activeLifelineSession: null,
    setActiveLifelineSession: (
        session: {
            questionId: string;
            expiresAt: number;
            participantCount: number;
            isActive: boolean;
        } | null,
    ) =>
        set({
            activeLifelineSession: session,
        }),

    hasUsedLifeline: false,
    setHasUsedLifeline: (used: boolean) =>
        set({
            hasUsedLifeline: used,
        }),

    clearLifelineData: () =>
        set({
            lifelineRequested: false,
            lifelineExpiresAt: null,
            lifelineResult: null,
            activeLifelineSession: null,
        }),

    resetQuestionLifelineState: () =>
        set({
            lifelineRequested: false,
            lifelineExpiresAt: null,
            lifelineResult: null,
            activeLifelineSession: null,
            alreadyResponded: false,
        }),
}));
