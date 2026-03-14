import { USER_TYPE } from '@nocturn/types';
import { create } from 'zustand';

interface RejoinPanelStore {
    active: boolean;
    setActive: (active: boolean) => void;

    description: string | null;
    joinBack: string | null;
    joinAs: USER_TYPE | null;
    setData: (
        desctiption: string | null,
        joinBack: string | null,
        joinAs: USER_TYPE | null,
    ) => void;

    joinData: {
        name: string | null;
        email: string | null;
        code: string | null;
    };
    setJoinData: (name: string | null, email: string | null, code: string | null) => void;
}

export const useRejoinPanelStore = create<RejoinPanelStore>((set) => ({
    active: false,
    setActive: (active) => set({ active }),

    description: null,
    joinBack: null,
    joinAs: null,
    setData: (description, joinBack, joinAs) => set({ description, joinAs, joinBack }),

    joinData: {
        name: null,
        email: null,
        code: null,
    },
    setJoinData: (name, email, code) => set({ joinData: { name, email, code } }),
}));
