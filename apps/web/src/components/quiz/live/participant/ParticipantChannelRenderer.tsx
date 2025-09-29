import { useRef } from 'react';
import ExpandableCard from '../common/ExpandableCard';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { useLiveQuizExpandableCardForParticipantStore } from '@/store/live-quiz/useLiveQuizExpandableCardForParticipantStore';
import ParticipantSettingPanel from './ParticipantSettingsPanel';
import ParticipantLeaderboard from './ParticipantLeaderboard';

export default function ParticipantPanelRenderer() {
    const expandableCardRef = useRef<HTMLDivElement>(null);
    const { type, setType, setIsExpanded, isExpanded } =
        useLiveQuizExpandableCardForParticipantStore();
    function handleClickOutside() {
        setType(null);
        setIsExpanded(false);
    }

    function renderer() {
        switch (type) {
            case 'SETTINGS':
                return <ParticipantSettingPanel />;

            case 'LEADERBOARD':
                return <ParticipantLeaderboard />;
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
