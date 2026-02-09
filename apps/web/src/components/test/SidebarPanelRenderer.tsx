'use client';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import HomePanel from './HomePanel';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import MyQuizzesPanel from './MyQuizzesPanel';
import FavouriteQuizzesPanel from './FavouriteQuizzesPanel';
import AIChatBoxrevamp from '../home/AiChat/AIChatBoxrevamp';
import SharedQuizPanel from './SharedQuizPanel';

function renderPanel(activeTab: SidebarTab) {
    switch (activeTab) {
        case SidebarTab.HOME:
            return <HomePanel />;
        case SidebarTab.MY_QUIZZES:
            return <MyQuizzesPanel />;
        case SidebarTab.SETTINGS:
            return;
        case SidebarTab.SHARED_WITH_ME:
            return <SharedQuizPanel />;
        case SidebarTab.FAVORITES:
            return <FavouriteQuizzesPanel />;
        default:
            return;
    }
}

export default function SidebarPanelRenderer() {
    const { activeTab } = useHomeSidebarStore();

    return (
        <div className="relative w-full">
            <AIChatBoxrevamp />

            {renderPanel(activeTab)}
        </div>
    );
}
