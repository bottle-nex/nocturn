import { create } from 'zustand';

interface SocketConnectionState {
    connectionGeneration: number;
    isConnected: boolean;
    onSocketOpen: () => void;
    onSocketClose: () => void;
}

export const useSocketConnectionStore = create<SocketConnectionState>((set) => ({
    connectionGeneration: 0,
    isConnected: false,
    onSocketOpen: () =>
        set((state) => ({
            connectionGeneration: state.connectionGeneration + 1,
            isConnected: true,
        })),
    onSocketClose: () => set({ isConnected: false }),
}));
