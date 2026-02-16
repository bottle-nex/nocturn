import { GameSessionType, QuestionType, QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface LifelineResult {
    mostPopularOption: number | null;
    totalResponses: number;
    wasSuccessful: boolean;
    optionBreakdown: number[];
}

interface LiveResponseData {
    optionCounts: number[];
    totalResponses: number;
    lastUpdated: number;
}

interface LiveQuizStore {
    quiz: QuizType;
    gameSession: GameSessionType | null;
    currentQuestion: QuestionType | null;
    nextQuestion: QuestionType | null;
    alreadyResponded: boolean;
    isNextQuestionAvailable: boolean;
    liveResponses: LiveResponseData;
    hasUsedLifeline: boolean;
    lifelineRequested: boolean;
    lifelineExpiresAt: number | null;
    lifelineResult: LifelineResult | null;
    lifelineLiveVotes: number[];
    spectatorOwnVote: number | null;
    lifelineVotesBySpectator: Record<string, number>;
    activeLifelineSession: {
        questionId: string;
        expiresAt: number;
        participantCount?: number;
        isActive: boolean;
    } | null;
    updateQuiz: (updatedFields: Partial<QuizType>) => void;
    removeQuestionFromQuiz: (id: string) => void;
    updateGameSession: (updatedFields: Partial<GameSessionType>) => void;
    updateCurrentQuestion: (updatedFields: Partial<QuestionType>) => void;
    updateNextQuestion: (updatedFields: Partial<QuestionType>) => void;
    setAlreadyResponded: (value: boolean) => void;
    setIsNextQuestonAvailable: (value: boolean) => void;
    updateLiveResponse: (selectedOption: number) => void;
    resetLiveResponses: () => void;
    getLiveResponsePercentages: () => number[];
    setHasUsedLifeline: (used: boolean) => void;
    setLifelineRequested: (requested: boolean, expiresAt?: number) => void;
    setLifelineResult: (result: LifelineResult) => void;
    updateLifelineLiveVotes: (voteCounts: number[]) => void;
    setActiveLifelineSession: (
        session: {
            questionId: string;
            expiresAt: number;
            participantCount?: number;
            isActive: boolean;
        } | null,
    ) => void;
    setSpectatorVote: (selectedOption: number) => void;
    addLifelineVote: (spectatorId: string, option: number) => void;
    getLifelineVoteCounts: () => number[];
    resetQuestionLifelineState: () => void;
    clearLifelineData: () => void;
}

export const useLiveQuizStore = create<LiveQuizStore>((set, get) => ({
    quiz: null as unknown as QuizType,
    updateQuiz: (updatedFields: Partial<QuizType>) => {
        set((state) => {
            const updatedQuiz: QuizType = { ...state.quiz, ...updatedFields };
            let currentQuestion: QuestionType | null = state.currentQuestion;

            if (updatedFields.questions?.length && !state.currentQuestion) {
                const questions = updatedFields.questions as QuestionType[];
                const firstAvailable =
                    questions
                        .filter((q) => q && !q.isAsked)
                        .sort((a, b) => (a?.orderIndex || 0) - (b?.orderIndex || 0))[0] ?? null;
                currentQuestion = firstAvailable ?? questions[0] ?? null;
            }

            return { quiz: updatedQuiz, currentQuestion };
        });
    },

    removeQuestionFromQuiz: (id: string) => {
        const questions = get().quiz.questions;
        if (!questions) return;

        const matchedQuestion = get().quiz.questions.find((q) => q.id === id);
        if (!matchedQuestion) return;

        set({
            quiz: {
                ...get().quiz,
                questions: get().quiz.questions.filter((q) => q.id !== id),
            },
        });
    },

    gameSession: null,
    updateGameSession: (updatedFields) =>
        set((state) => ({
            gameSession: { ...state.gameSession, ...updatedFields } as GameSessionType,
        })),

    currentQuestion: null,
    updateCurrentQuestion: (
        updateFields: Partial<QuestionType> | null
    ) =>
        set((state) => {
            if (updateFields === null) return { currentQuestion: null };
            if (!state.currentQuestion) return { currentQuestion: updateFields as QuestionType };
            return {
                currentQuestion: {
                    ...state.currentQuestion,
                    ...updateFields,
                },
            };
        }),


    nextQuestion: null,
    updateNextQuestion: (updateFields) =>
        set((state) => {
            const next = state.nextQuestion;

            if (!updateFields) return { nextQuestion: next };

            if (updateFields.id !== undefined && updateFields.question !== undefined) {
                return { nextQuestion: updateFields as QuestionType };
            }

            if (next) {
                return { nextQuestion: { ...next, ...updateFields } as QuestionType };
            }

            if (updateFields.id !== undefined) {
                return { nextQuestion: updateFields as QuestionType };
            }

            return { nextQuestion: null };
        }),

    alreadyResponded: false,
    setAlreadyResponded: (value) => set({ alreadyResponded: value }),

    isNextQuestionAvailable: false,
    setIsNextQuestonAvailable: (value: boolean) => set({ isNextQuestionAvailable: value }),

    liveResponses: {
        optionCounts: [0, 0, 0, 0],
        totalResponses: 0,
        lastUpdated: Date.now(),
    },
    updateLiveResponse: (selectedOption) =>
        set((state) => {
            const newCounts = [...state.liveResponses.optionCounts];
            if (selectedOption >= 0 && selectedOption < newCounts.length) {
                newCounts[selectedOption]!++;
            }
            return {
                liveResponses: {
                    optionCounts: newCounts,
                    totalResponses: state.liveResponses.totalResponses + 1,
                    lastUpdated: Date.now(),
                },
            };
        }),
    resetLiveResponses: () =>
        set({
            liveResponses: {
                optionCounts: [0, 0, 0, 0],
                totalResponses: 0,
                lastUpdated: Date.now(),
            },
        }),
    getLiveResponsePercentages: () => {
        const { optionCounts, totalResponses } = get().liveResponses;
        if (totalResponses === 0) return [0, 0, 0, 0];
        return optionCounts.map((c) => Math.round((c / totalResponses) * 100));
    },

    hasUsedLifeline: false,
    setHasUsedLifeline: (used) => set({ hasUsedLifeline: used }),

    lifelineRequested: false,
    lifelineExpiresAt: null,
    setLifelineRequested: (requested, expiresAt) =>
        set({
            lifelineRequested: requested,
            lifelineExpiresAt: expiresAt ?? null,
            // Initialize live votes when requesting
            lifelineLiveVotes: requested ? [0, 0, 0, 0] : [],
        }),

    lifelineResult: null,
    setLifelineResult: (result) =>
        set({
            lifelineResult: result,
            lifelineRequested: false,
        }),

    // NEW: Live vote tracking
    lifelineLiveVotes: [],
    updateLifelineLiveVotes: (voteCounts) => set({ lifelineLiveVotes: voteCounts }),

    activeLifelineSession: null,
    setActiveLifelineSession: (session) => set({ activeLifelineSession: session }),

    spectatorOwnVote: null,
    setSpectatorVote: (selectedOption) => set({ spectatorOwnVote: selectedOption }),

    lifelineVotesBySpectator: {},
    addLifelineVote: (spectatorId, option) =>
        set((state) => ({
            lifelineVotesBySpectator: {
                ...state.lifelineVotesBySpectator,
                [spectatorId]: option,
            },
        })),

    getLifelineVoteCounts: () => {
        const votes = get().lifelineVotesBySpectator;
        const counts = [0, 0, 0, 0];
        Object.values(votes).forEach((option) => {
            if (option >= 0 && option <= 3) {
                counts[option]!++;
            }
        });
        return counts;
    },

    resetQuestionLifelineState: () =>
        set({
            activeLifelineSession: null,
            alreadyResponded: false,
            lifelineRequested: false,
            lifelineExpiresAt: null,
            lifelineResult: null,
            lifelineLiveVotes: [],
            liveResponses: {
                optionCounts: [0, 0, 0, 0],
                totalResponses: 0,
                lastUpdated: Date.now(),
            },
            currentQuestion: null,
            nextQuestion: null,
        }),

    clearLifelineData: () =>
        set({
            spectatorOwnVote: null,
            lifelineVotesBySpectator: {},
            activeLifelineSession: null,
            lifelineRequested: false,
            lifelineExpiresAt: null,
            lifelineResult: null,
            lifelineLiveVotes: [],
        }),
}));
