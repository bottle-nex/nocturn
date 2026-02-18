import SpectatorQuestionActiveRenderer from '../QuestionReadingScreen/SpectatorQuestionActiveRenderer';
import SpectatorQuestionActiveFooter from './SpectatorQuestionActiveFooter';

export default function SpectatorQuestionActiveScreen() {
    return (
        <div className="w-full h-full flex">
            <SpectatorQuestionActiveRenderer />
            <SpectatorQuestionActiveFooter />
        </div>
    );
}
