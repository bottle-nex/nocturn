import { create } from 'zustand';

// export type MultiplierType = 'Linear' | 'Stepped' | 'Manual' | null;
export enum MultiplierEnum {
    LINEAR = "LINEAR",
    STEPPED = "STEPPED",
    MANUAL = "MANUAL",
    NONE = "NONE",
}

interface PointMultiplierAdvanced {
    enablePointMultiplier: boolean;
    multiplierType: MultiplierEnum;
    inputPointMultiplier: string;
    manualPoints: number[];
    setEnablePointMultiplier: (val: boolean) => void;
    setMultiplierType: (type: MultiplierEnum) => void;
    setInputPointMultiplier: (val: string) => void;
    setManualPoints: (points: number[]) => void;
    setManualPointAt: (index: number, value: number) => void;
}

export const usePointsMultiplierAdvStore = create<PointMultiplierAdvanced>((set, get) => ({
    enablePointMultiplier: false,
    multiplierType: MultiplierEnum.NONE,
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
