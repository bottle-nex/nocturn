'use client';
import HomeSidebar from '@/components/test/HomeSidebar';
import HomeTrashPanel from '@/components/test/HomeTrashPanel';
import SidebarPanelRenderer from '@/components/test/SidebarPanelRenderer';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';

export default function Home() {
    const { activeTab } = useHomeSidebarStore();

    const isTrashOpen = activeTab === SidebarTab.TRASH;

    return (
        <div className="tracking-wider dark:bg-neutral-950 h-screen w-screen overflow-hidden relative">
            <div className="flex h-full">
                <HomeSidebar />
                <SidebarPanelRenderer />
            </div>

            {isTrashOpen && (
                <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm">
                    <HomeTrashPanel />
                </div>
            )}
        </div>
    );
}
