'use client';

import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { ParticipantScreenEnum, USER_TYPE } from '@/types/prisma-types';
import ParticipantLobbyScreen from './screens/LobbyScreen/ParticipantLobbyScreen';
import ParticipantMotivationScreen from './screens/QuestionMotivationScreen/ParticipantMotivationScreen';
import ParticipantQuestionReadingScreen from './screens/QuestionReadingScreen/ParticipantQuestionReadingScreen';
import ParticipantMainFooter from './ParticipantMainFooter';
import ParticipantPanelRenderer from './ParticipantChannelRenderer';
import ParticipantQuestionActiveScreen from './screens/QuestionActiveScreen/ParticipantQuestionActiveScreen';
import ParticipantQuestionResultsScreen from './screens/QuestionResultsScreen/ParticipantQuestionResultsScreen';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUserRoleStore } from '@/store/live-quiz/useLiveQuizUserStore';
import FullScreenWarningPanel from '../common/FullScreenWarningPanel';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { cleanWebSocketClient } from '@/lib/singleton-socket';
import { useRouter } from 'next/navigation';
import { useParticipantWarning } from '@/hooks/quiz/useParticipantWarning';

export default function ParticipantMainScreen() {
    const { currentUserType } = useUserRoleStore();
    const { gameSession } = useLiveQuizStore();

    const [fullscreenAccepted, setFullscreenAccepted] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const { handleParticipantLeaveGameSession, handleAddParticipantWarningCount } = useWebSocket();
    const router = useRouter();

    useParticipantWarning();
    // add useWebSocket and useSubcribeEventHandler here and same in the SpectatorMainScreen, HostMainScreen

    useEffect(() => {
        function checkKeyPress(e: KeyboardEvent) {
            if (
                e.key === 'Escape' ||
                e.key === 'Tab' ||
                e.key === 'Shift' ||
                e.key === 'Control' ||
                e.key === 'Meta' ||
                e.key === 'Alt'
            ) {
                e.preventDefault();
                toast.error(`Key press: ${e.key}`);
            }
        }

        document.addEventListener('keydown', checkKeyPress);
        return () => {
            document.removeEventListener('keydown', checkKeyPress);
        };
    }, []);

    useEffect(() => {
        function handleChange() {
            if (!document.fullscreenElement) {
                if (gameSession?.participantScreen === ParticipantScreenEnum.LOBBY) {
                    toast.error('Kindly swtich to full-screen mode, if the quiz starts you will be kicked as per your warnings.');
                } else {
                    handleAddParticipantWarningCount({});
                }
            }
        }
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, [gameSession?.participantScreen]);

    useEffect(() => {
        function handleChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (
            currentUserType === USER_TYPE.PARTICIPANT &&
            fullscreenAccepted &&
            isFullscreen
        ) {
            setAllowed(true);
        } else {
            setAllowed(false);
        }
    }, [currentUserType, fullscreenAccepted, isFullscreen]);

    function accept() {
        requestFullscreen();
        setFullscreenAccepted(true);
    }

    function deny() {
        handleParticipantLeaveGameSession({});
        cleanWebSocketClient();
        router.back();
    }

    function requestFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
    }

    function renderHostScreenPanels() {
        if (gameSession?.participantScreen === ParticipantScreenEnum.LOBBY) return <ParticipantLobbyScreen />;

        if (!allowed) return;

        switch (gameSession?.participantScreen) {

            case ParticipantScreenEnum.QUESTION_MOTIVATION:
                return <ParticipantMotivationScreen />;

            case ParticipantScreenEnum.QUESTION_READING:
                return <ParticipantQuestionReadingScreen />;

            case ParticipantScreenEnum.QUESTION_ACTIVE:
                return <ParticipantQuestionActiveScreen />;

            case ParticipantScreenEnum.QUESTION_RESULTS:
                return <ParticipantQuestionResultsScreen />;
        }
    }
    return (
        <div className="h-full relative w-full flex z-20">
            {currentUserType === USER_TYPE.PARTICIPANT &&
                !allowed && (
                    <FullScreenWarningPanel accept={accept} deny={deny} />
                )}
            {renderHostScreenPanels()}
            <ParticipantMainFooter />
            <ParticipantPanelRenderer />
        </div>
    );
}
