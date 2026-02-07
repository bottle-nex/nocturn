import { create } from 'zustand';

export enum SELECTION_MODE {
    CANVAS = 'CANVAS',
    OPTION = 'OPTION',
    QUESTION = 'QUESTION',
    INTERACTION = 'INTERACTION',
}

interface CanvasSelectionStore {
    currentOn: SELECTION_MODE;
    style: string;
    setCurrentOn: (value: SELECTION_MODE) => void;
}

export const useCanvasSelectionStore = create<CanvasSelectionStore>((set) => ({
    currentOn: SELECTION_MODE.OPTION,
    style: 'border-[1px] outline-2 outline-indigo-800/80 border-white',
    setCurrentOn: (value) => {
        set({
            currentOn: value,
        });
    },
}));
