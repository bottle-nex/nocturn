import SpectatorLobbyScreen from '@/components/spectator-controls/SpectatorLobbyScreen';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { SpectatorScreenEnum } from '@nocturn/types';
import SpectatorMainFooter from './SpectatorMainFooter';
import SpectatorPanelRenderer from './SpectatorChannelRenderer';
import SpectatorMotivationScreen from './screens/QuestionMotivationScreen/SpectatorMotivationScreen';
import SpectatorQuestionReadingScreen from './screens/QuestionReadingScreen/SpectatorQuestionReadingScreen';
import SpectatorQuestionActiveScreen from './screens/QuestionActiveScreen/SpectatorQuestionActiveScreen';
import SpectatorQuestionResultsScreen from './screens/QuestionResultsScreen/SpectatorQuestionResultsScreen';
import { SpectatorQuizResultScreen } from './screens/QuizResultsScreen/SpectatorQuizResultScreen';

export default function SpectatorMainScreen() {
    const { gameSession } = useLiveQuizStore();

    function renderHostScreenPanels() {
        switch (gameSession?.spectatorScreen) {
            case SpectatorScreenEnum.LOBBY:
                return <SpectatorLobbyScreen />;

            case SpectatorScreenEnum.QUESTION_MOTIVATION:
                return <SpectatorMotivationScreen />;

            case SpectatorScreenEnum.QUESTION_READING:
                return <SpectatorQuestionReadingScreen />;

            case SpectatorScreenEnum.QUESTION_ACTIVE:
                return <SpectatorQuestionActiveScreen />;

            case SpectatorScreenEnum.QUESTION_RESULTS:
                return <SpectatorQuestionResultsScreen />;

            case SpectatorScreenEnum.QUIZ_RESULTS:
                return <SpectatorQuizResultScreen />;
        }
    }
    return (
        <div className="h-full relative w-full flex">
            {renderHostScreenPanels()}
            <SpectatorMainFooter />
            <SpectatorPanelRenderer />
        </div>
    );
}
