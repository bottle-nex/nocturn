import UtilityCard from '@/components/utility/UtilityCard';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { JSX } from 'react';

export default function ParticipantQuestionActiveFooter(): JSX.Element {
    const { currentQuestion, quiz } = useLiveQuizStore();
    return (
        <div
            style={{
                color: quiz.template.textColor,
            }}
            className="relative shrink-0 mx-3 mt-2 sm:mx-0 sm:mt-0 sm:absolute sm:bottom-4 sm:left-4 z-20 sm:z-100 flex items-center justify-start gap-x-4 w-fit max-w-[calc(100%-1.5rem)] max-h-[25%] overflow-y-auto"
        >
            {currentQuestion?.hint && (
                <UtilityCard className="sm:min-w-[16rem] max-w-[20rem] w-fit px-4 py-2 text-wrap">
                    <div className="text-sm tracking-wide dark:text-light-base text-dark-alpha font-light">
                        {currentQuestion?.hint}
                    </div>
                </UtilityCard>
            )}
        </div>
    );
}
