'use client';
import { useUserRoleStore } from '@/store/live-quiz/useLiveQuizUserStore';
import HostMainScreen from './host/HostMainScreen';
import SpectatorMainScreen from './spectator/SpectatorMainScreen';
import ParticipantMainScreen from './participant/ParticipantMainScreen';
import { USER_TYPE } from '@nocturn/types';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import StakeAmountPill from './host/StakeAmountPill';

export default function LiveUserRendererScreens() {
    const { currentUserType } = useUserRoleStore();
    const { quiz } = useLiveQuizStore();

    function renderCurrentUserScreen() {
        switch (currentUserType) {
            case USER_TYPE.HOST:
                return <HostMainScreen />;

            case USER_TYPE.PARTICIPANT:
                return <ParticipantMainScreen />;

            case USER_TYPE.SPECTATOR:
                return <SpectatorMainScreen />;

            default:
                return <div>Unknown</div>;
        }
    }

    return (
        <div className="w-full h-full relative">
            {quiz.prizePool > 0 && <StakeAmountPill />}
            <StakeAmountPill />
            {renderCurrentUserScreen()}
        </div>
    );
}
