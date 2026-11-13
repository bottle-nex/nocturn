import ParticipantQuestionActiveFooter from './ParticipantQuestionActiveFooter';
import ParticipantQuestionActiveRenderer from './ParticipantQuestionActiveRenderer';

export default function ParticipantQuestionActiveScreen() {
    return (
        <div className="flex flex-col sm:flex-row h-full w-full relative pb-20 sm:pb-0">
            <ParticipantQuestionActiveRenderer />
            <ParticipantQuestionActiveFooter />
        </div>
    );
}
