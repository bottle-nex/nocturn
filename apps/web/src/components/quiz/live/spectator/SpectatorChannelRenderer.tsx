import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { useRef } from 'react';
import ExpandableCard from '../common/ExpandableCard';
import SpectatorChatPanel from './SpectatorChatPanel';
import SpectatorPeoplePanel from './SpectatorPeoplePanel';
import { useLiveQuizExpandableCardForSpectatorStore } from '@/store/live-quiz/useLiveQuizExpandableCardForSpectatorStore';
import SpectatorSettingsPanel from './SpectatorSettingsPanel';
import SpectatorLeaderboardPanel from './SpectatorLeaderboardPanel';

export default function SpectatorPanelRenderer() {
    const expandableCardRef = useRef<HTMLDivElement>(null);
    const { type, setType, setIsExpanded, isExpanded } =
        useLiveQuizExpandableCardForSpectatorStore();
    function handleClickOutside() {
        setType(null);
        setIsExpanded(false);
    }

    function renderer() {
        switch (type) {
            case 'LEADERBOARD':
                return <SpectatorLeaderboardPanel />;
            case 'CHAT':
                return <SpectatorChatPanel />;
            case 'PEOPLE':
                return <SpectatorPeoplePanel />;
            case 'SETTINGS':
                return <SpectatorSettingsPanel />;
        }
    }

    useHandleClickOutside([expandableCardRef], handleClickOutside);
    return (
        type && (
            <ExpandableCard
                setIsExpanded={setIsExpanded}
                isExpanded={isExpanded}
                ref={expandableCardRef}
            >
                {renderer()}
            </ExpandableCard>
        )
    );
}
