'use client';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { use, useEffect } from 'react';
import LiveGameScreens from '@/components/quiz/live/LiveGameScreens';
import { syncLiveQuizState } from '@/lib/live-quiz-sync';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { SOCKET_RECONNECTED } from '@/socket/socket.client';

export interface NewProps {
    params: Promise<{ quizId: string }>;
}

export default function New({ params }: NewProps) {
    const resolvedParams = use(params);
    const quizId = resolvedParams.quizId;
    const quiz = useLiveQuizStore((state) => state.quiz);
    const { subscribeToHandler, unsubscribeToHandler } = useWebSocket();

    useEffect(() => {
        syncLiveQuizState(`${quizId}`, true);
    }, [quizId]);

    // the quiz keeps moving while the socket is down, so pull the current state back in
    useEffect(() => {
        const handleReconnect = () => {
            syncLiveQuizState(`${quizId}`);
        };
        subscribeToHandler(SOCKET_RECONNECTED, handleReconnect);
        return () => unsubscribeToHandler(SOCKET_RECONNECTED, handleReconnect);
    }, [quizId, subscribeToHandler, unsubscribeToHandler]);

    if (!quiz) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen select-none">
            <LiveGameScreens />
        </div>
    );
}
