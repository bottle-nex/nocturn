import { AiQuizMessage, QuizType } from '@nocturn/types';
import { create } from 'zustand';

export interface AiUsage {
    used: number;
    limit: number | null;
    remaining: number | null;
    resetsAt: string;
}

interface AiChatStore {
    usage: AiUsage | null;
    usageError: string | null;
    setUsage: (usage: AiUsage | null) => void;
    setUsageError: (error: string | null) => void;

    sessionId: string | null;
    setSessionId: (sessionId: string) => void;

    expanded: boolean;
    setExpanded: (expanded: boolean) => void;

    messages: AiQuizMessage[];
    setMessages: (messages: AiQuizMessage[]) => void;
    appendMessage: (message: AiQuizMessage) => void;
    appendMultipleMessages: (messages: AiQuizMessage[]) => void;

    quiz: QuizType | null;
    setQuiz: (quiz: QuizType | null) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;

    preview: boolean;
    setPreview: (preview: boolean) => void;

    typingMessageIds: string[];
    addTypingMessage: (id: string) => void;
    removeTypingMessage: (id: string) => void;

    resetChat: () => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
    usage: null,
    usageError: null,
    setUsage: (usage) => set({ usage }),
    setUsageError: (usageError) => set({ usageError }),
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
    setQuiz: (quiz: QuizType | null) => set({ quiz }),

    loading: false,
    setLoading: (loading: boolean) => set({ loading }),

    preview: false,
    setPreview: (preview: boolean) => set({ preview }),

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
