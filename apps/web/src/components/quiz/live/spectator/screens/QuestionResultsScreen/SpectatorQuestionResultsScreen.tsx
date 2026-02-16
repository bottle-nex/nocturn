'use client';
import { useEffect } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import Leaderboard from '../../../common/Leaderboard/Leaderboard';

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
            <div className='text-dark-alpha p-2 flex flex-col gap-y-4 '>
                <div className='text-3xl'>
                    {currentQuestion.question}
                </div>
                <div className='flex flex-col gap-y-2'>
                    {currentQuestion.options.map((option, i) => (
                        <div
                            key={i}
                            className='w-fit border border-dark-alpha px-3 py-1.5 rounded-beta text-lg '
                        >
                            {option}
                        </div>
                    ))}
                </div>
            </div>
            <Leaderboard
                className='relative z-10 '
            />
        </div>
    );
}
