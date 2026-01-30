'use client';
import AiChatBox from '@/components/home/AiChat/AiChatBox';
import PreviewQuiz from '@/components/home/AiChat/PreviewQuiz';
import HomeSidebar from '@/components/test/HomeSidebar';
import HomeTrashPanel from '@/components/test/HomeTrashPanel';
import SidebarPanelRenderer from '@/components/test/SidebarPanelRenderer';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';

export default function Home() {
    const { activeTab } = useHomeSidebarStore();
    const { quiz, preview, setPreview } = useAiChatStore();

    const isTrashOpen = activeTab === SidebarTab.TRASH;

    return (
        <div className="tracking-wider dark:bg-neutral-950 h-full w-screen overflow-x-hidden relative">
            <div className="flex h-full">
                <HomeSidebar />
                <SidebarPanelRenderer />
            </div>

            <AiChatBox />

            {preview && <PreviewQuiz quiz={quiz!} onPreviewClose={() => setPreview(false)} />}

            {isTrashOpen && (
                <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm">
                    <HomeTrashPanel />
                </div>
            )}
        </div>
    );
}
