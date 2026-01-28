import { AiQuizMessage, QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface AiChatStore {
    sessionId: string | null;
    setSessionId: (sessionId: string) => void;

    messages: AiQuizMessage[];
    setMessages: (messages: AiQuizMessage[]) => void;
    appendMessage: (message: AiQuizMessage) => void;
    appendMultipleMessages: (messages: AiQuizMessage[]) => void;

    quiz: QuizType | null;
    setQuiz: (quiz: QuizType) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
    sessionId: null,
    setSessionId: (sessionId: string) => set({ sessionId }),

    messages: [],
    setMessages: (messages: AiQuizMessage[]) => set({ messages }),
    appendMessage: (message: AiQuizMessage) => set({ messages: [...get().messages, message] }),
    appendMultipleMessages: (messages: AiQuizMessage[]) => {
        for(const m of messages) {
            get().appendMessage(m);
        }
    },

    quiz: null,
    setQuiz: (quiz: QuizType) => set({ quiz }),

    loading: false,
    setLoading: (loading: boolean) => set({ loading }),
}));
