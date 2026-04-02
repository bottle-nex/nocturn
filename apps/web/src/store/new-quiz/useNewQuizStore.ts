import {
    QuestionType,
    QuizStatusEnum,
    QuizType,
    InteractionEnum,
    TemplateType,
    PointsMultiplier,
} from '@nocturn/types';
import { create } from 'zustand';

const default_template: TemplateType = {
    id: 'CLASSIC',
    name: 'CLASSIC',
    backgroundColor: '#F6F5F2',
    textColor: '#000000',
    borderColor: '#000000',
    accentType: 'mountains',
    accentColor: '#00000010',
    bars: ['#E2C275', '#6886C5', '#CD5656', '#AEDADD', '#BCBAB8'],
    src: 'classic-template',
    createdAt: new Date(),
    updatedAt: new Date(),
};

interface NewQuizStoreTypes {
    quiz: QuizType;
    currentQuestionIndex: number;
    loading: boolean;
    pendingTemplate: TemplateType | null;
    isHoveringTemplate: TemplateType | null;
    setIsHoveringTemplate: (template: TemplateType | null) => void;
    setLoading: (loading: boolean) => void;
    updateQuiz: (quiz: Partial<QuizType>) => void;
    setPendingTemplate: (template: TemplateType | null) => void;
    addQuestion: () => void;
    getQuestion: (questionIndex: number) => QuestionType | null;
    editQuestion: (questionIndex: number, question: Partial<QuestionType>) => void;
    removeQuestion: (index: number) => void;
    setInteractions: (Interactions: InteractionEnum[]) => void;
    toggleInteraction: (interaction: InteractionEnum) => void;
    changeQuestionPoint: (questionIndex: number, point: number) => void;
    updateQuestionPoints: (points: number[]) => void;
    setCurrentQuestionIndex: (index: number) => void;
    resetStore: () => void;
}

export const useNewQuizStore = create<NewQuizStoreTypes>((set, get) => ({
    quiz: {
        id: '',
        title: '',
        description: '',
        templateId: '',
        template: default_template,
        prizePool: 0,
        currency: '',
        basePointsPerQuestion: 100,
        pointsMultiplier: PointsMultiplier.NONE,
        pointsIncrement: 1,
        batchSize: 3,
        timeBonus: false,
        eliminationThreshold: 0,
        questionTimeLimit: 0,
        breakBetweenQuestions: 0,
        status: QuizStatusEnum.NULL,
        isDeleted: false,
        isFavourite: false,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        scheduledAt: null,
        startedAt: null,
        endedAt: null,
        autoSave: true,
        liveChat: false,
        allowNewSpectator: true,
        spectatorMode: false,
        questions: [
            {
                id: '',
                question: '',
                options: ['', '', ''],
                correctAnswer: 0,
                explanation: '',
                difficulty: 1,
                basePoints: 100,
                readingTime: 4,
                hint: '',
                timeLimit: 30,
                orderIndex: 0,
                imageUrl: '',
                quizId: '',
                isAsked: false,
                hintLaunched: false,
            },
        ],
        interactions: [],
        prizeDistributions: [],
    },

    pendingTemplate: null,
    setPendingTemplate: (template) => set({ pendingTemplate: template }),

    isHoveringTemplate: null,
    setIsHoveringTemplate: (template: TemplateType | null) => set({ isHoveringTemplate: template }),

    currentQuestionIndex: 0,
    setCurrentQuestionIndex: (index: number) => set({ currentQuestionIndex: index }),

    updateQuiz: (data: Partial<QuizType>) => {
        const quiz = get().quiz;
        set({ quiz: { ...quiz, ...data } });
    },

    addQuestion: () => {
        const question: QuestionType = {
            id: '',
            question: 'This is question',
            options: ['One', 'Two ', 'Three'],
            correctAnswer: 0,
            explanation: '',
            difficulty: 1,
            basePoints: 100,
            readingTime: 4,
            hint: '',
            timeLimit: 30,
            orderIndex: get().quiz.questions.length,
            imageUrl: '',
            quizId: '',
            isAsked: false,
            hintLaunched: false,
        };
        set((state) => ({
            quiz: { ...state.quiz, questions: [...state.quiz.questions, question] },
        }));
    },

    editQuestion: (questionIndex: number, question: Partial<QuestionType>) => {
        const quiz = get().quiz;
        set({
            quiz: {
                ...quiz,
                questions: quiz.questions.map((q, index) =>
                    index === questionIndex ? { ...q, ...question } : q,
                ),
            },
        });
    },

    removeQuestion: (index: number) => {
        const quiz = get().quiz;
        if (quiz.questions.length <= 1) return;
        const currentIdx = get().currentQuestionIndex;
        const updatedQuestions = quiz.questions
            .filter((_, i) => i !== index)
            .map((q, i) => ({ ...q, orderIndex: i }));

        // Determine the new current question index
        let newIndex: number;
        if (updatedQuestions.length === 0) {
            newIndex = 0;
        } else if (currentIdx >= updatedQuestions.length) {
            newIndex = updatedQuestions.length - 1;
        } else if (index < currentIdx) {
            newIndex = currentIdx - 1;
        } else {
            newIndex = Math.min(currentIdx, updatedQuestions.length - 1);
        }

        set({
            quiz: { ...quiz, questions: updatedQuestions },
            currentQuestionIndex: Math.max(0, newIndex),
        });
    },

    updateQuestionPoints: (points: number[]) => {
        const quiz = get().quiz;
        const newQuestions: QuestionType[] = quiz.questions.map(
            (qs: QuestionType, index: number) => {
                return {
                    ...qs,
                    basePoints: points[index] ?? qs.basePoints,
                };
            },
        );
        set({
            quiz: {
                ...quiz,
                questions: newQuestions,
            },
        });
    },

    changeQuestionPoint: (questionIndex: number, point: number) => {
        get().editQuestion(questionIndex, { basePoints: point });
    },

    getQuestion(questionIndex: number) {
        if (questionIndex < 0) return null;

        const quiz = get().quiz;
        const question: QuestionType = quiz.questions.find((_, index) => index === questionIndex)!;
        return question;
    },
    loading: false,
    setLoading: (loading: boolean) => set({ loading }),

    toggleInteraction: (interaction: InteractionEnum) =>
        set((state) => {
            const exists = state.quiz.interactions.includes(interaction);
            const updated = exists
                ? state.quiz.interactions.filter((i) => i !== interaction)
                : [...state.quiz.interactions, interaction];
            return {
                quiz: {
                    ...state.quiz,
                    interactions: updated,
                },
            };
        }),

    setInteractions: (interactions: InteractionEnum[]) => {
        const quiz = get().quiz;
        set({ quiz: { ...quiz, interactions } });
    },

    resetStore: () => {
        set({
            pendingTemplate: null,
            quiz: {
                id: '',
                title: '',
                description: '',
                templateId: '',
                template: default_template,
                prizePool: 0,
                currency: '',
                basePointsPerQuestion: 100,
                pointsMultiplier: PointsMultiplier.NONE,
                pointsIncrement: 1,
                batchSize: 3,
                timeBonus: false,
                eliminationThreshold: 0,
                questionTimeLimit: 0,
                breakBetweenQuestions: 0,
                status: QuizStatusEnum.NULL,
                isDeleted: false,
                isFavourite: false,
                deletedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                scheduledAt: null,
                startedAt: null,
                endedAt: null,
                autoSave: true,
                liveChat: false,
                allowNewSpectator: true,
                spectatorMode: false,
                questions: [
                    {
                        id: '',
                        question: '',
                        options: ['', '', ''],
                        correctAnswer: 0,
                        explanation: '',
                        difficulty: 1,
                        basePoints: 100,
                        readingTime: 4,
                        hint: '',
                        timeLimit: 30,
                        orderIndex: 0,
                        imageUrl: '',
                        quizId: '',
                        isAsked: false,
                        hintLaunched: false,
                    },
                ],
                interactions: [],
            },
        });
    },
}));
