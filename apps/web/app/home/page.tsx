'use client';
import HomeSidebar from '@/components/test/HomeSidebar';
import HomeTrashPanel from '@/components/test/HomeTrashPanel';
import SidebarPanelRenderer from '@/components/test/SidebarPanelRenderer';
import { SidebarTabBottom } from '@/constants/SidebarTabConstants';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';

export default function Home() {
    const { bottomActiveTab } = useHomeSidebarStore();

    const isTrashOpen = bottomActiveTab === SidebarTabBottom.TRASH;

    return (
        <div className="tracking-wider bg-delta h-screen w-screen overflow-hidden relative">
            <div className="flex gap-x-2 px-4 pb-4 py-2 h-full">
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
