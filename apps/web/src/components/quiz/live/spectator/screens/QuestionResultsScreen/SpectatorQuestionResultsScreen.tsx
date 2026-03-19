'use client';
import { useEffect } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import QuestionLeaderboardDisplay from '../../../common/QuestionLeaderboardDisplay';

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
        <div className="w-full h-full">
            <QuestionLeaderboardDisplay />
        </div>
    );
}
