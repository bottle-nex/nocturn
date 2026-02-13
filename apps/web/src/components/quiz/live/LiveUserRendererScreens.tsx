'use client';

import { useUserRoleStore } from '@/store/live-quiz/useLiveQuizUserStore';
import HostMainScreen from './host/HostMainScreen';
import SpectatorMainScreen from './spectator/SpectatorMainScreen';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import ParticipantMainScreen from './participant/ParticipantMainScreen';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useSubscribeEventHandlers } from '@/hooks/sockets/useSubscribeEventHandlers';
import { USER_TYPE } from '@nocturn/types';

export default function LiveUserRendererScreens() {
    const { currentUserType } = useUserRoleStore();
    const { quiz } = useLiveQuizStore();

    const template = quiz?.theme;

    useWebSocket();
    useSubscribeEventHandlers();

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

    return <div className="w-full h-full relative">{renderCurrentUserScreen()}</div>;
}
