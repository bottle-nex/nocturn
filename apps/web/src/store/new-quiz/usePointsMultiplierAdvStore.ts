import { create } from 'zustand';

export type MultiplierType = 'Linear' | 'Stepped' | 'Manual' | null;

interface PointMultiplierAdvanced {
    enablePointMultiplier: boolean;
    multiplierType: MultiplierType;
    inputPointMultiplier: string;
    manualPoints: number[];
    setEnablePointMultiplier: (val: boolean) => void;
    setMultiplierType: (type: MultiplierType) => void;
    setInputPointMultiplier: (val: string) => void;
    setManualPoints: (points: number[]) => void;
    setManualPointAt: (index: number, value: number) => void;
}

export const usePointsMultiplierAdvStore = create<PointMultiplierAdvanced>((set, get) => ({
    enablePointMultiplier: false,
    multiplierType: null,
    inputPointMultiplier: '1.2',
    manualPoints: [],
    setEnablePointMultiplier: (val) => set({ enablePointMultiplier: val }),
    setMultiplierType: (type) => set({ multiplierType: type }),
    setInputPointMultiplier: (val) => set({ inputPointMultiplier: val }),
    setManualPoints: (points) => set({ manualPoints: points }),
    setManualPointAt: (index, value) => {
        const current = [...get().manualPoints];
        current[index] = value;
        set({ manualPoints: current });
    },
}));
