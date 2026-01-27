import { AiQuizMessage, QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface AiChatStore {
    messages: AiQuizMessage[];
    setMessages: (messages: AiQuizMessage[]) => void;
    appendMessage: (message: AiQuizMessage) => void;

    quiz: QuizType | null;
    setQuiz: (quiz: QuizType) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
    messages: [],
    setMessages: (messages: AiQuizMessage[]) => set({ messages }),
    appendMessage: (message: AiQuizMessage) => set({ messages: [...get().messages, message] }),

    quiz: null,
    setQuiz: (quiz: QuizType) => set({ quiz }),

    loading: false,
    setLoading: (loading: boolean) => set({ loading }),
}));
