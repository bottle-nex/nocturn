'use client';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import HomePanel from './HomePanel';
import { SidebarTab } from '@/constants/SidebarTabConstants';

export default function SidebarPanelRenderer() {
    const { activeTab } = useHomeSidebarStore();

    switch (activeTab) {
        case SidebarTab.HOME:
            return <HomePanel />;
        case SidebarTab.SETTINGS:
            return;
        default:
            return;
    }
}
