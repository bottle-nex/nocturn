'use client';

import { useUserRoleStore } from '@/store/live-quiz/useLiveQuizUserStore';
import HostMainScreen from './host/HostMainScreen';
import SpectatorMainScreen from './spectator/SpectatorMainScreen';
import { templates } from '@/lib/templates';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import CanvasAccents from '@/components/utility/CanvasAccents';
import ParticipantMainScreen from './participant/ParticipantMainScreen';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useSubscribeEventHandlers } from '@/hooks/sockets/useSubscribeEventHandlers';
import AppLogo from '@/components/app/AppLogo';
import { USER_TYPE } from '@/types/prisma-types';
import FullScreenWarningPanel from './common/FullScreenWarningPanel';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cleanWebSocketClient } from '@/lib/singleton-socket';

export default function LiveUserRendererScreens() {
    const { currentUserType } = useUserRoleStore();
    const { quiz } = useLiveQuizStore();
    const router = useRouter();

    const [fullscreenAccepted, setFullscreenAccepted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const template = quiz?.theme ? templates.find((template) => template.id === quiz.theme) : null;

    useWebSocket();
    useSubscribeEventHandlers();

    const { handleParticipantLeaveGameSession } = useWebSocket();

    useEffect(() => {
        function handleChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (currentUserType === USER_TYPE.HOST) {
            setAllowed(true);
        } else if (
            (currentUserType === USER_TYPE.PARTICIPANT ||
                currentUserType === USER_TYPE.SPECTATOR) &&
            fullscreenAccepted &&
            isFullscreen
        ) {
            setAllowed(true);
        } else {
            setAllowed(false);
        }
    }, [currentUserType, fullscreenAccepted, isFullscreen]);

    function requestFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }

    function renderCurrentUserScreen() {
        if (!allowed) return null;

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

    function accept() {
        requestFullscreen();
        setFullscreenAccepted(true);
    }

    function deny() {
        handleParticipantLeaveGameSession({});
        cleanWebSocketClient();
        router.back();
    }

    return (
        <div
            className="h-full w-full relative"
            style={{
                backgroundColor: template?.background_color,
                color: template?.text_color,
            }}
        >
            <AppLogo className="absolute top-4 left-4" />
            <CanvasAccents design={template?.accent_type} accentColor={template?.accent_color} />

            {(currentUserType === USER_TYPE.PARTICIPANT ||
                currentUserType === USER_TYPE.SPECTATOR) &&
                !allowed && <FullScreenWarningPanel accept={accept} deny={deny} />}

            {renderCurrentUserScreen()}
        </div>
    );
}
