'use client';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import HomePanel from './HomePanel';
import { SidebarTab } from '@/constants/SidebarTabConstants';

export default function SidebarPanelRenderer() {
    const { activeTab } = useHomeSidebarStore();

    switch (activeTab) {
        case SidebarTab.HOME:
            return <HomePanel />;
        case SidebarTab.ANALYTICS:
            return;
        case SidebarTab.DOCUMENTS:
            return;
        case SidebarTab.SETTINGS:
            return;
        case SidebarTab.TEAM:
            return;
        default:
            return;
    }
}
