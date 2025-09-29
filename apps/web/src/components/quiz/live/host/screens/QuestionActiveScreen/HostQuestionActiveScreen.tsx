import HostQuestionActiveFooter from './HostQuestionActiveFooter';
import HostQuestionActiveRenderer from './HostQuestionActiveRenderer';

export default function HostQuestionActiveScreen() {
    return (
        <div className="flex h-full w-full relative ">
            <HostQuestionActiveRenderer />
            <HostQuestionActiveFooter />
        </div>
    );
}
