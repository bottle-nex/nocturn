import { create } from 'zustand';

interface DragQuizStoreData {
    draggingQuizId: string | null;
    isDragging: boolean;
    isOverTrash: boolean;
    startDrag: (quizId: string) => void;
    endDrag: () => void;
    setOverTrash: (isOver: boolean) => void;
}

export const useDragQuizStore = create<DragQuizStoreData>((set) => ({
    draggingQuizId: null,
    isDragging: false,
    isOverTrash: false,
    startDrag: (quizId) => set({ draggingQuizId: quizId, isDragging: true }),
    endDrag: () => set({ draggingQuizId: null, isDragging: false, isOverTrash: false }),
    setOverTrash: (isOver) => set({ isOverTrash: isOver }),
}));
