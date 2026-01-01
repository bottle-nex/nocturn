import { SpectatorType } from '@nocturn/types';
import { create } from 'zustand';

interface LiveSpectatorProps {
    spectators: SpectatorType[];
    setSpectators: (spectators: SpectatorType[]) => void;
    getSpectator: (spectatorId: string) => SpectatorType | undefined;
    upsertSpectator: (spectator: SpectatorType) => void;
    removeSpectator: (spectatorId: string) => void;
}

export const useLiveSpectatorsStore = create<LiveSpectatorProps>((set, get) => ({
    spectators: [],

    setSpectators: (spectatorData: SpectatorType[]) => {
        set({
            spectators: spectatorData,
        });
    },

    getSpectator: (spectatorId: string) => {
        return get().spectators.find((s) => s.id === spectatorId);
    },

    removeSpectator: (spectatorId: string) => {
        set((state) => ({
            spectators: state.spectators.filter((s) => s.id !== spectatorId),
        }));
    },

    upsertSpectator: (spectator: SpectatorType) => {
        set((state) => {
            const existingIndex = state.spectators.findIndex((s) => s.id === spectator.id);

            if (existingIndex !== -1) {
                const updatedSpectators = [...state.spectators];
                const exisingSpectator = updatedSpectators[existingIndex]!;
                updatedSpectators[existingIndex] = {
                    ...updatedSpectators[existingIndex],
                    ...spectator,
                    id: exisingSpectator.id,
                };
                return { spectators: updatedSpectators };
            } else {
                return {
                    spectators: [...state.spectators, spectator],
                };
            }
        });
    },
}));
