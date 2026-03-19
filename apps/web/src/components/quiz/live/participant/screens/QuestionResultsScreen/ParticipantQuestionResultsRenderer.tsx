'use client';
import { useEffect } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
import QuestionLeaderboardDisplay from '../../../common/QuestionLeaderboardDisplay';

export default function ParticipantQuestionResultsRenderer() {
    const { currentQuestion, setAlreadyResponded } = useLiveQuizStore();
    const { myRank, myScore, totalParticipants } = useLeaderboardStore();

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
            <QuestionLeaderboardDisplay
                showMyRank
                myRank={myRank}
                myScore={myScore}
                totalParticipants={totalParticipants}
            />
        </div>
    );
}
