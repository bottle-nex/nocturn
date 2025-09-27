'use client';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { HostScreenEnum } from '@/types/prisma-types';
import HostLobbyScreen from './screens/LobbyScreen/HostLobbyScreen';
import HostQuestionPreviewScreen from './screens/QuestionPreviewScreen/HostQuestionPreviewScreen';
import HostMainFooter from './HostMainFooter';
import HostPanelRenderer from './controls/HostPanelRenderer';
import HostQuestionResultsScreen from './screens/QuestionResultsScreen/HostQuestionResultsScreen';
import HostQuestionActiveScreen from './screens/QuestionActiveScreen/HostQuestionActiveScreen';
import HostQuestionReadingScreen from './screens/QuestionReadingScreen/HostQuestionReadingScreen';
import FinalResultsScreen from '../common/FinalResultsScreen';

export default function HostMainScreen() {
    const { gameSession } = useLiveQuizStore();

    function renderHostScreenPanels() {
        switch (gameSession?.hostScreen) {
            case HostScreenEnum.LOBBY:
                return <HostLobbyScreen />;

            case HostScreenEnum.QUESTION_PREVIEW:
                return <HostQuestionPreviewScreen />;

            case HostScreenEnum.QUESTION_READING:
                return <HostQuestionReadingScreen />;

            case HostScreenEnum.QUESTION_ACTIVE:
                return <HostQuestionActiveScreen />;

            case HostScreenEnum.QUESTION_RESULTS:
                return <HostQuestionResultsScreen />;

            case HostScreenEnum.FINAL_RESULTS:
                return <FinalResultsScreen />;
        }
    }

    return (
        <div className="h-full relative w-full flex">
            {renderHostScreenPanels()}
            <HostMainFooter />
            <HostPanelRenderer />
        </div>
    );
}
