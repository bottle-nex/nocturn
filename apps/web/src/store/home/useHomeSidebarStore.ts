import { SidebarTab } from '@/constants/SidebarTabConstants';
import { create } from 'zustand';

interface HomeSidebarStoreData {
    activeTab: SidebarTab;
    setActiveTab: (activeTab: SidebarTab) => void;
}

export const useHomeSidebarStore = create<HomeSidebarStoreData>((set) => ({
    activeTab: SidebarTab.HOME,
    setActiveTab: (activeTab) => set({ activeTab }),
}));
