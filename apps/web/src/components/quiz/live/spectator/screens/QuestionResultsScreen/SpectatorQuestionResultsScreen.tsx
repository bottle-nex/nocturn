'use client';
import { useEffect } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import Leaderboard from '../../../common/Leaderboard/Leaderboard';
import { cn } from '@/lib/utils';
import NotchCard from '@/components/ui/NotchCard';

export default function ParticipantQuestionResultsRenderer() {
    const { currentQuestion, setAlreadyResponded } = useLiveQuizStore();

    useEffect(() => {
        setAlreadyResponded(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    if (!currentQuestion) {
        return (
            <div className="text-center text-neutral-400 w-full">Error in fetching question</div>
        );
    }

    return (
        <div className='w-full flex justify-between items-center '>
            <div className='text-dark-alpha p-2 flex flex-col items-end w-full gap-y-4 '>
                <div className='text-3xl w-full flex justify-end '>
                    {currentQuestion.question}
                </div>
                <div className='gap-y-2 w-full flex flex-col items-end '>
                    {currentQuestion.options.map((option, i) => {
                        const correct = i === currentQuestion.correctAnswer;
                        return (
                            <div className="w-fit">
                                <NotchCard
                                    label={correct ? 'correct answer' : ''}
                                    className={cn(
                                        correct ? "border-[#00bd00] " : "",
                                        'rounded-beta ',
                                    )}
                                >
                                    <div>{option}</div>
                                </NotchCard>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Leaderboard
                className='relative z-10 '
                spectator
            />
        </div>
    );
}
