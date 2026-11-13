'use client';

import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { ParticipantScreenEnum, USER_TYPE } from '@nocturn/types';
import ParticipantLobbyScreen from './screens/LobbyScreen/ParticipantLobbyScreen';
import ParticipantMotivationScreen from './screens/QuestionMotivationScreen/ParticipantMotivationScreen';
import ParticipantQuestionReadingScreen from './screens/QuestionReadingScreen/ParticipantQuestionReadingScreen';
import ParticipantMainFooter from './ParticipantMainFooter';
import ParticipantPanelRenderer from './ParticipantChannelRenderer';
import ParticipantQuestionActiveScreen from './screens/QuestionActiveScreen/ParticipantQuestionActiveScreen';
import ParticipantQuestionResultsScreen from './screens/QuestionResultsScreen/ParticipantQuestionResultsScreen';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { useUserRoleStore } from '@/store/live-quiz/useLiveQuizUserStore';
import FullScreenWarningPanel from '../common/FullScreenWarningPanel';
import { supportsFullscreen } from '@/lib/fullscreen';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { cleanWebSocketClient } from '@/lib/singleton-socket';
import { useRouter } from 'next/navigation';
import { useParticipantWarning } from '@/hooks/quiz/useParticipantWarning';
import { ParticipantQuizResultScreen } from './screens/QuizResultsScreen/ParticipantQuizResultScreen';

export default function ParticipantMainScreen() {
    const { currentUserType } = useUserRoleStore();
    const { gameSession } = useLiveQuizStore();

    const [fullscreenAccepted, setFullscreenAccepted] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [fullscreenRequired, setFullscreenRequired] = useState<boolean | null>(null);

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
            if (supportsFullscreen(document) && !document.fullscreenElement) {
                if (gameSession?.participantScreen === ParticipantScreenEnum.LOBBY) {
                    toast.error(
                        'Kindly swtich to full-screen mode, if the quiz starts you will be kicked as per your warnings.',
                    );
                } else {
                    handleAddParticipantWarningCount({});
                }
            }
        }
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameSession?.participantScreen]);

    useEffect(() => {
        function handleChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        setFullscreenRequired(supportsFullscreen(document));
        handleChange();
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    // useEffect(() => {
    //     function handleVisibilityChange() {
    //         if (document.visibilityState === 'hidden') {
    //             if (gameSession?.participantScreen === ParticipantScreenEnum.LOBBY) {
    //                 toast.error(
    //                     'Do not switch tabs. When quiz starts, you may be kicked based on warnings.',
    //                 );
    //             } else {
    //                 handleAddParticipantWarningCount({});
    //             }
    //         }
    //     }

    //     document.addEventListener('visibilitychange', handleVisibilityChange);

    //     return () => {
    //         document.removeEventListener('visibilitychange', handleVisibilityChange);
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [gameSession?.participantScreen]);

    const allowed =
        currentUserType === USER_TYPE.PARTICIPANT &&
        (fullscreenRequired === false || (fullscreenAccepted && isFullscreen));

    async function accept() {
        try {
            await document.documentElement.requestFullscreen();
            setFullscreenAccepted(true);
            setIsFullscreen(!!document.fullscreenElement);
        } catch {
            toast.error('Could not enter full-screen mode. Please try again.');
        }
    }

    function deny() {
        handleParticipantLeaveGameSession({});
        cleanWebSocketClient();
        router.back();
    }

    function renderHostScreenPanels() {
        if (gameSession?.participantScreen === ParticipantScreenEnum.LOBBY)
            return <ParticipantLobbyScreen />;

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
            case ParticipantScreenEnum.QUIZ_RESULTS:
                return <ParticipantQuizResultScreen />;
        }
    }
    return (
        <div className="h-full relative w-full flex z-20">
            {currentUserType === USER_TYPE.PARTICIPANT && fullscreenRequired && !allowed && (
                <FullScreenWarningPanel accept={accept} deny={deny} />
            )}
            {renderHostScreenPanels()}
            <ParticipantMainFooter />
            <ParticipantPanelRenderer />
        </div>
    );
}
