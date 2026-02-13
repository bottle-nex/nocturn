import { create } from 'zustand';
import { TemplateType } from '@nocturn/types';

interface QuizTemplatesStoreData {
    templates: TemplateType[];
    setTemplates: (templates: TemplateType[]) => void;

    activeTemplate: TemplateType | null;
    setActiveTemplate: (template: TemplateType) => void;

    resetTemplates: () => void;
}

export const useQuizTemplatesStore = create<QuizTemplatesStoreData>((set) => ({
    templates: [],
    setTemplates: (templates) => set({ templates }),

    activeTemplate: null,
    setActiveTemplate: (template) => set({ activeTemplate: template }),

    resetTemplates: () =>
        set({
            templates: [],
            activeTemplate: null,
        }),
}));
