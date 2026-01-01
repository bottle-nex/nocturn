import { HostScreenEnum } from '@nocturn/types';
import { create } from 'zustand';

interface LiveQuizHostStoreProps {
    currentScreen: HostScreenEnum | null;
    setCurrentScreen: (currentScreen: HostScreenEnum) => void;

    liveResponses: number[];
    updateLiveResponses: (option: number) => void;
    emptyLiveResponses: () => void;
}

export const useLiveQuizHostStore = create<LiveQuizHostStoreProps>((set) => ({
    currentScreen: null,
    setCurrentScreen: (currentScreen: HostScreenEnum) => {
        set({ currentScreen });
    },

    liveResponses: [0, 0, 0, 0],
    updateLiveResponses: (option: number) => {
        set((state) => {
            const liveResponses = [...state.liveResponses];

            while (liveResponses.length <= option) {
                liveResponses.push(0);
            }

            liveResponses[option] = (liveResponses[option] ?? 0) + 1;
            return { liveResponses: liveResponses };
        });
    },
    emptyLiveResponses: () => set({ liveResponses: [0, 0, 0, 0] }),
}));
