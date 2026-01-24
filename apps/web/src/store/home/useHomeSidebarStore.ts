import { SidebarTab } from '@/constants/SidebarTabConstants';
import { create } from 'zustand';

interface HomeSidebarStoreData {
    activeTab: SidebarTab | null;
    setActiveTab: (activeTab: SidebarTab | null) => void;
}

export const useHomeSidebarStore = create<HomeSidebarStoreData>((set) => ({
    activeTab: SidebarTab.HOME,
    setActiveTab: (activeTab) => set({ activeTab }),
}));
