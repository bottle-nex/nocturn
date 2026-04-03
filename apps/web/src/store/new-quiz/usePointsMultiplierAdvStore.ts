import { PointsMultiplier, QuizType } from '@nocturn/types';
import { create } from 'zustand';

interface PointMultiplierAdvanced {
    enablePointMultiplier: boolean;
    multiplierType: PointsMultiplier;
    inputPointMultiplier: string;
    steppedBatchSize: number;
    steppedIncrement: number;
    manualPoints: number[];
    setEnablePointMultiplier: (val: boolean) => void;
    setMultiplierType: (type: PointsMultiplier) => void;
    setInputPointMultiplier: (val: string) => void;
    setSteppedBatchSize: (size: number) => void;
    setSteppedIncrement: (val: number) => void;
    setManualPoints: (points: number[]) => void;
    setManualPointAt: (index: number, value: number) => void;
    initializeFromQuiz: (quiz: QuizType) => void;
}

export const usePointsMultiplierAdvStore = create<PointMultiplierAdvanced>((set, get) => ({
    enablePointMultiplier: false,
    multiplierType: PointsMultiplier.NONE,
    inputPointMultiplier: '1.2',
    steppedBatchSize: 2,
    steppedIncrement: 10,
    manualPoints: [],
    setEnablePointMultiplier: (val) => set({ enablePointMultiplier: val }),
    setMultiplierType: (type) => set({ multiplierType: type }),
    setInputPointMultiplier: (val) => set({ inputPointMultiplier: val }),
    setSteppedBatchSize: (size) => set({ steppedBatchSize: Math.min(15, Math.max(1, size)) }),
    setSteppedIncrement: (val) => set({ steppedIncrement: Math.max(1, val) }),
    setManualPoints: (points) => set({ manualPoints: points }),
    setManualPointAt: (index, value) => {
        const current = [...get().manualPoints];
        current[index] = value;
        set({ manualPoints: current });
    },
    initializeFromQuiz: (quiz) => {
        const type = quiz.pointsMultiplier ?? PointsMultiplier.NONE;
        const isEnabled = type !== PointsMultiplier.NONE;
        const updates: Partial<PointMultiplierAdvanced> = {
            enablePointMultiplier: isEnabled,
            multiplierType: type,
            steppedIncrement: quiz.pointsIncrement ?? 10,
            steppedBatchSize: quiz.batchSize ?? 3,
        };
        // For Manual mode, populate manualPoints directly from question basePoints
        if (type === PointsMultiplier.MANUAL && quiz.questions?.length) {
            updates.manualPoints = quiz.questions.map((q) => q.basePoints);
        }
        set(updates);
    },
}));
