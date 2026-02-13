import { create } from 'zustand';

export enum LivePage {
    LIVE = 'LIVE',
    SPECTATOR_LIMIT_REACHED = 'SPECTATOR_LIMIT_REACHED',
}

interface SocketActionState {
    state: LivePage;
    setState: (state: LivePage) => void;
}

export const useSocketActionStore = create<SocketActionState>((set) => ({
    state: LivePage.LIVE,
    setState: (state: LivePage) => set({ state }),
}));
