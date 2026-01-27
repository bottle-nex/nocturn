import { create } from 'zustand';

export type MultiplierType = 'Linear' | 'Stepped' | 'Manual' | null;

interface PointMultiplierAdvanced {
    enablePointMultiplier: boolean;
    multiplierType: MultiplierType;
    inputPointMultiplier: string;
    setEnablePointMultiplier: (val: boolean) => void;
    setMultiplierType: (type: MultiplierType) => void;
    setInputPointMultiplier: (val: string) => void;
}

export const usePointsMultiplierAdvStore = create<PointMultiplierAdvanced>((set) => ({
    enablePointMultiplier: false,
    multiplierType: null,
    inputPointMultiplier: '1.2',
    setEnablePointMultiplier: (val) => set({ enablePointMultiplier: val }),
    setMultiplierType: (type) => set({ multiplierType: type }),
    setInputPointMultiplier: (val) => set({ inputPointMultiplier: val }),
}));
