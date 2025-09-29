import ParticipantQuestionActiveFooter from './ParticipantQuestionActiveFooter';
import ParticipantQuestionActiveRenderer from './ParticipantQuestionActiveRenderer';

export default function ParticipantQuestionActiveScreen() {
    return (
        <div className="flex h-full w-full">
            <ParticipantQuestionActiveRenderer />
            <ParticipantQuestionActiveFooter />
        </div>
    );
}
