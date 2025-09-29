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
    currentQuestion: QuestionType | null | undefined;
    updateCurrentQuestion: (updatedFields: Partial<QuestionType>) => void;
    nextQuestion: QuestionType | null | undefined;
    updateNextQuestion: (updateFields: Partial<QuestionType>) => void;
    alreadyResponded: boolean;
    setAlreadyResponded: (value: boolean) => void;

    // Live response tracking
    liveResponses: LiveResponseData;
    updateLiveResponse: (selectedOption: number) => void;
    resetLiveResponses: () => void;
    getLiveResponsePercentages: () => number[];

    // Lifelines
    hasUsedLifeline: boolean;
    setHasUsedLifeline: (used: boolean) => void;
    lifelineActive: boolean;
    setLifelineActive: (active: boolean) => void;
    lifelineVotes: Record<string, number>;
    updateLifelineVote: (spectatorId: string, option: number) => void;
    setSpectatorVote: (selectedOption: number) => void; // helper for spectator confirmation
    clearLifelineVotes: () => void;

    lifelineRequested: boolean;
    lifelineExpiresAt: number | null;
    setLifelineRequested: (requested: boolean, expiresAt?: number) => void;

    lifelineResult: LifelineResult | null;
    setLifelineResult: (result: LifelineResult) => void;

    activeLifelineSession: {
        questionId: string;
        expiresAt: number;
        participantCount?: number; // made optional
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

    resetQuestionLifelineState: () => void;

    lifelineVotesBySpectator: Record<string, number>; // spectatorId -> selectedOption
    addLifelineVote: (spectatorId: string, option: number) => void;
    getLifelineVoteCounts: () => number[];

    clearLifelineData: () => void;
}

export const useLiveQuizStore = create<LiveQuizStore>((set, get) => ({
    quiz: {} as QuizType,
    updateQuiz: (updatedFields: Partial<QuizType>) => {
        set((state) => {
            const updatedQuiz: QuizType = {
                ...state.quiz,
                ...updatedFields,
            };

            let currentQuestion = state.currentQuestion;

            if (
                updatedFields.questions &&
                updatedFields.questions.length > 0 &&
                !state.currentQuestion
            ) {
                const questions = updatedFields.questions as QuestionType[];
                const firstAvailableQuestion = questions
                    .filter((q) => q && !q.isAsked)
                    .sort((a, b) => (a?.orderIndex || 0) - (b?.orderIndex || 0))[0];

                currentQuestion = firstAvailableQuestion ?? questions[0];
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
            if (updateFields.id && updateFields.question) {
                return {
                    currentQuestion: updateFields as QuestionType,
                };
            }
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

    liveResponses: {
        optionCounts: [0, 0, 0, 0],
        totalResponses: 0,
        lastUpdated: Date.now(),
    },
    updateLiveResponse: (selectedOption: number) => {
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
        });
    },
    resetLiveResponses: () => {
        set({
            liveResponses: {
                optionCounts: [0, 0, 0, 0],
                totalResponses: 0,
                lastUpdated: Date.now(),
            },
        });
    },
    getLiveResponsePercentages: () => {
        const { optionCounts, totalResponses } = get().liveResponses;
        if (totalResponses === 0) return [0, 0, 0, 0];

        return optionCounts.map((count) => Math.round((count / totalResponses) * 100));
    },

    // Lifeline state
    hasUsedLifeline: false,
    setHasUsedLifeline: (used: boolean) => set({ hasUsedLifeline: used }),
    lifelineActive: false,
    setLifelineActive: (active: boolean) =>
        set({
            lifelineActive: active,
            lifelineVotes: active ? {} : get().lifelineVotes,
        }),
    lifelineVotes: {},
    updateLifelineVote: (spectatorId: string, option: number) =>
        set((state) => ({
            lifelineVotes: {
                ...state.lifelineVotes,
                [spectatorId]: option,
            },
        })),
    setSpectatorVote: (selectedOption: number) =>
        set((state) => ({
            lifelineVotes: {
                ...state.lifelineVotes,
                self: selectedOption,
            },
        })),

    clearLifelineVotes: () =>
        set({
            lifelineVotes: {},
            lifelineActive: false,
        }),

    lifelineRequested: false,
    lifelineExpiresAt: null,
    setLifelineRequested: (requested: boolean, expiresAt?: number) =>
        set({
            lifelineRequested: requested,
            lifelineExpiresAt: expiresAt ?? null,
        }),

    lifelineResult: null,
    setLifelineResult: (result: LifelineResult) =>
        set({
            lifelineResult: result,
            lifelineRequested: false,
        }),

    activeLifelineSession: null,
    setActiveLifelineSession: (session) =>
        set({
            activeLifelineSession: session,
        }),

    resetQuestionLifelineState: () =>
        set({
            lifelineActive: false,
            lifelineVotes: {},
            activeLifelineSession: null,
            alreadyResponded: false,
            lifelineRequested: false,
            lifelineExpiresAt: null,
            lifelineResult: null,
            liveResponses: {
                optionCounts: [0, 0, 0, 0],
                totalResponses: 0,
                lastUpdated: Date.now(),
            },
        }),

    lifelineVotesBySpectator: {},

    addLifelineVote: (spectatorId: string, option: number) => {
        set((state) => ({
            lifelineVotesBySpectator: {
                ...state.lifelineVotesBySpectator,
                [spectatorId]: option,
            },
        }));
    },

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

    clearLifelineData: () =>
        set({
            lifelineActive: false,
            lifelineVotesBySpectator: {},
            activeLifelineSession: null,
            lifelineRequested: false,
            lifelineExpiresAt: null,
            lifelineResult: null,
        }),
}));
