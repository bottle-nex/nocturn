import { GameSessionType, QuestionType, QuizType } from '@/types/prisma-types';
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
    updateQuiz: (updatedFields: Partial<QuizType>) => void;
    gameSession: GameSessionType | null;
    updateGameSession: (updatedFields: Partial<GameSessionType>) => void;
    currentQuestion: QuestionType | null;
    updateCurrentQuestion: (updatedFields: Partial<QuestionType>) => void;
    nextQuestion: QuestionType | null;
    updateNextQuestion: (updatedFields: Partial<QuestionType>) => void;
    alreadyResponded: boolean;
    setAlreadyResponded: (value: boolean) => void;

    liveResponses: LiveResponseData;
    updateLiveResponse: (selectedOption: number) => void;
    resetLiveResponses: () => void;
    getLiveResponsePercentages: () => number[];

    hasUsedLifeline: boolean;
    setHasUsedLifeline: (used: boolean) => void;

    lifelineRequested: boolean;
    lifelineExpiresAt: number | null;
    setLifelineRequested: (requested: boolean, expiresAt?: number) => void;

    lifelineResult: LifelineResult | null;
    setLifelineResult: (result: LifelineResult) => void;

    // NEW: Live vote counts (updated in real-time)
    lifelineLiveVotes: number[];
    updateLifelineLiveVotes: (voteCounts: number[]) => void;

    activeLifelineSession: {
        questionId: string;
        expiresAt: number;
        participantCount?: number;
        isActive: boolean;
    } | null;
    setActiveLifelineSession: (
        session: {
            questionId: string;
            expiresAt: number;
            participantCount?: number;
            isActive: boolean;
        } | null,
    ) => void;

    spectatorOwnVote: number | null;
    setSpectatorVote: (selectedOption: number) => void;

    lifelineVotesBySpectator: Record<string, number>;
    addLifelineVote: (spectatorId: string, option: number) => void;
    getLifelineVoteCounts: () => number[];

    resetQuestionLifelineState: () => void;
    clearLifelineData: () => void;
}

export const useLiveQuizStore = create<LiveQuizStore>((set, get) => ({
    quiz: {} as QuizType,
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

    gameSession: null,
    updateGameSession: (updatedFields) =>
        set((state) => ({
            gameSession: { ...state.gameSession, ...updatedFields } as GameSessionType,
        })),

    currentQuestion: null,
    updateCurrentQuestion: (updateFields) =>
        set((state) => {
            const current = state.currentQuestion;

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

            return { currentQuestion: null };
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
