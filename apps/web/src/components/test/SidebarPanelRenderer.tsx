'use client';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import HomePanel from './HomePanel';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import MyQuizzesPanel from './MyQuizzesPanel';
import FavouriteQuizzesPanel from './FavouriteQuizzesPanel';
import SharedQuizPanel from './SharedQuizPanel';
import AIChatBoxRevamp from '../home/AiChat/AIChatBoxrevamp';

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
        <div className="relative flex-1 h-full overflow-hidden">
            <AIChatBoxRevamp />
            {renderPanel(activeTab)}
        </div>
    );
}
