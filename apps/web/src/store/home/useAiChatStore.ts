import { AiQuizMessage, QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface AiChatStore {
    sessionId: string | null;
    setSessionId: (sessionId: string) => void;

    expanded: boolean;
    setExpanded: (expanded: boolean) => void;

    messages: AiQuizMessage[];
    setMessages: (messages: AiQuizMessage[]) => void;
    appendMessage: (message: AiQuizMessage) => void;
    appendMultipleMessages: (messages: AiQuizMessage[]) => void;

    quiz: QuizType | null;
    setQuiz: (quiz: QuizType) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;

    preview: boolean;
    setPreview: (preview: boolean) => void;

    expanded: boolean;
    setExpanded: (value: boolean) => void;

    typingMessageIds: string[];
    addTypingMessage: (id: string) => void;
    removeTypingMessage: (id: string) => void;

    resetChat: () => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
    sessionId: null,
    setSessionId: (sessionId: string) => set({ sessionId }),

    expanded: false,
    setExpanded: (expanded: boolean) => set({ expanded }),

    messages: [],
    setMessages: (messages: AiQuizMessage[]) => set({ messages }),
    appendMessage: (message: AiQuizMessage) => set({ messages: [...get().messages, message] }),
    appendMultipleMessages: (messages: AiQuizMessage[]) => {
        for (const m of messages) {
            get().appendMessage(m);
        }
    },

    quiz: null,
    setQuiz: (quiz: QuizType) => set({ quiz }),

    loading: false,
    setLoading: (loading: boolean) => set({ loading }),

    preview: false,
    setPreview: (preview: boolean) => set({ preview }),

    expanded: false,
    setExpanded: (value: boolean) => set({ expanded: value }),

    typingMessageIds: [],
    addTypingMessage: (id: string) =>
        set((state) => ({
            typingMessageIds: [...state.typingMessageIds, id],
        })),
    removeTypingMessage: (id: string) =>
        set((state) => ({
            typingMessageIds: state.typingMessageIds.filter((msgId) => msgId !== id),
        })),

    resetChat: () =>
        set({
            quiz: null,
            loading: false,
            messages: [],
            sessionId: null,
            preview: false,
            expanded: false,
            typingMessageIds: [],
        }),
}));
