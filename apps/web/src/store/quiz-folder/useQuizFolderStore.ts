import { QuizFolderType } from '@/types/prisma-types';
import { create } from 'zustand';

interface QuizFolderStoreData {
    folders: QuizFolderType[];
    addFolder: (folder: QuizFolderType) => void;
    setFolders: (folders: QuizFolderType[]) => void;
    deleteFolder: (folderId: string) => void;
}

export const useQuizFolderStore = create<QuizFolderStoreData>((set) => ({
    folders: [],
    addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
    setFolders: (folders) => set({ folders }),
    deleteFolder: (folderId) =>
        set((state) => ({
            folders: state.folders.filter((f) => f.id != folderId),
        })),
}));
