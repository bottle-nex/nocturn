import { ChatMessageType, ChatReactionType } from '@nocturn/types';
import { create } from 'zustand';

interface LiveQuizGlobalChatStore {
    chatMessages: ChatMessageType[];
    addChatMessage: (chatMessage: ChatMessageType) => void;
    setChatMessages: (chatMessages: ChatMessageType[]) => void;
    addChatReaction: (reaction: ChatReactionType) => void;
    removeReaction: (chatMessageId: string, reactorName: string, reaction: string) => void;
    clearChat: () => void;
}

export const useLiveQuizGlobalChatStore = create<LiveQuizGlobalChatStore>((set) => ({
    chatMessages: [],

    addChatMessage: (chatMessage) => {
        set((state) => ({
            chatMessages: [...state.chatMessages, chatMessage],
        }));
    },

    setChatMessages: (chatMessages) => {
        set((state) => ({
            chatMessages: [...state.chatMessages, ...chatMessages],
        }));
    },

    addChatReaction: (chatReaction) => {
        set((state) => ({
            chatMessages: state.chatMessages.map((msg) =>
                msg.id === chatReaction.chatMessageId
                    ? {
                          ...msg,
                          chatReactions: msg.chatReactions.some(
                              (r) =>
                                  r.reactorName === chatReaction.reactorName &&
                                  r.reaction === chatReaction.reaction,
                          )
                              ? msg.chatReactions
                              : [...msg.chatReactions, chatReaction],
                      }
                    : msg,
            ),
        }));
    },

    removeReaction: (chatMessageId, reactorName, reaction) => {
        set((state) => ({
            chatMessages: state.chatMessages.map((msg) =>
                msg.id === chatMessageId
                    ? {
                          ...msg,
                          chatReactions: msg.chatReactions.filter(
                              (r) => !(r.reactorName === reactorName && r.reaction === reaction),
                          ),
                      }
                    : msg,
            ),
        }));
    },

    clearChat: () => {
        set({ chatMessages: [] });
    },
}));
