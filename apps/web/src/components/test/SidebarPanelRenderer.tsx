'use client';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import HomePanel from './HomePanel';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import MyQuizzesPanel from './MyQuizzesPanel';
import FavouriteQuizzesPanel from './FavouriteQuizzesPanel';
import SharedQuizPanel from './SharedQuizPanel';
import SettingsPanel from './SettingsPanel';
import AIChatBoxRevamp from '../home/AiChat/AIChatBoxrevamp';
import HomeTour from '../home/HomeTour';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

function renderPanel(activeTab: SidebarTab) {
    switch (activeTab) {
        case SidebarTab.HOME:
            return <HomePanel />;
        case SidebarTab.MY_QUIZZES:
            return <MyQuizzesPanel />;
        case SidebarTab.SETTINGS:
            return <SettingsPanel />;
        case SidebarTab.SHARED_WITH_ME:
            return <SharedQuizPanel />;
        case SidebarTab.FAVORITES:
            return <FavouriteQuizzesPanel />;
        default:
            return <div></div>;
    }
}

export default function SidebarPanelRenderer() {
    const { activeTab } = useHomeSidebarStore();
    const { session, tutorialComplete } = useUserSessionStore();

    return (
        <div className="relative flex-1 h-full overflow-hidden">
            <AIChatBoxRevamp />
            {renderPanel(activeTab)}
            {session?.user && tutorialComplete === false && <HomeTour />}
        </div>
    );
}
