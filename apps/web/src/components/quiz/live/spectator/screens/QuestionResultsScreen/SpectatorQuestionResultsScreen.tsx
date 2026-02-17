'use client';
import { useEffect } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import Leaderboard from '../../../common/Leaderboard/Leaderboard';
import { cn } from '@/lib/utils';
import NotchCard from '@/components/ui/NotchCard';

export default function SpectatorQuestionResultsRenderer() {
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
            <Leaderboard
                spectator
                explanation={currentQuestion.explanation || ''}
                className='relative z-10 '
            />
            <div className='text-dark-alpha p-2 flex flex-col items-start w-full gap-y-4 '>
                <div className='text-3xl w-full flex justify-start '>
                    {currentQuestion.question}
                </div>
                <div className='gap-y-2 w-full flex flex-col items-start '>
                    {currentQuestion.options.map((option, i) => {
                        const correct = i === currentQuestion.correctAnswer;
                        return (
                            <div
                                key={i}
                                className="w-fit"
                            >
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
        </div>
    );
}
