import { SidebarTab, SidebarTabBottom } from '@/constants/SidebarTabConstants';
import { create } from 'zustand';

interface HomeSidebarStoreData {
    activeTab: SidebarTab;
    setActiveTab: (activeTab: SidebarTab) => void;

    bottomActiveTab: SidebarTabBottom | null;
    setBottomActiveTab: (bottomActiveTab: SidebarTabBottom | null) => void;
}

export const useHomeSidebarStore = create<HomeSidebarStoreData>((set) => ({
    activeTab: SidebarTab.HOME,
    setActiveTab: (activeTab) => set({ activeTab }),

    bottomActiveTab: null,
    setBottomActiveTab: (bottomActiveTab) => set({ bottomActiveTab }),
}));
