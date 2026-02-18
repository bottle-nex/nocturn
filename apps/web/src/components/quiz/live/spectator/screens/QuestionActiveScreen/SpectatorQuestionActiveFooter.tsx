import UtilityCard from '@/components/utility/UtilityCard';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { JSX } from 'react';

export default function SpectatorQuestionActiveFooter(): JSX.Element {
    const { currentQuestion, quiz } = useLiveQuizStore();
    return (
        <div
            style={{
                color: quiz.template.textColor,
            }}
            className="absolute bottom-4 left-4 z-100 flex items-center justify-start gap-x-4 w-fit"
        >
            {currentQuestion?.hint && (
                <UtilityCard className="min-w-[16rem] max-w-[20rem] w-fit px-4 py-2 text-wrap">
                    <div className="text-sm tracking-wide dark:text-light-base text-dark-alpha font-light">
                        {currentQuestion?.hint}
                    </div>
                </UtilityCard>
            )}
        </div>
    );
}
