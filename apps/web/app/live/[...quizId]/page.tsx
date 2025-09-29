'use client';
import LiveUserRendererScreens from '@/components/quiz/live/LiveUserRendererScreens';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizGlobalChatStore } from '@/store/live-quiz/useLiveQuizGlobalChatStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import {
    useLiveHostStore,
    useLiveParticipantStore,
    useLiveSpectatorStore,
    useUserRoleStore,
} from '@/store/live-quiz/useLiveQuizUserStore';
import { useLiveSpectatorsStore } from '@/store/live-quiz/useLiveSpectatorsStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';
import { toast } from 'sonner';

export interface NewProps {
    params: Promise<{
        quizId: string;
    }>;
}

export default function New({ params }: NewProps) {
    const { quizId } = use(params);
    const router = useRouter();

    const { quiz, updateQuiz, updateGameSession, updateCurrentQuestion } = useLiveQuizStore();
    const { setHostData } = useLiveHostStore();
    const { setParticipantData } = useLiveParticipantStore();
    const { setSpectatorData } = useLiveSpectatorStore();
    const { setCurrentUserType } = useUserRoleStore();
    const { setChatMessages } = useLiveQuizGlobalChatStore();
    const { setParticipants } = useLiveParticipantsStore();
    const { setSpectators } = useLiveSpectatorsStore();

    useEffect(() => {
        async function getLiveData() {
            try {
                const { data } = await axios.get(`${LIVE_QUIZ_DATA_URL}/${quizId}`, {
                    withCredentials: true,
                });
                if (data.success) {
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    setChatMessages(data.messages || []);
                    if (data.question) {
                        updateCurrentQuestion(data.question);
                    }
                    switch (data.role) {
                        case 'HOST':
                            setHostData(data.userData);
                            break;
                        case 'PARTICIPANT':
                            setParticipantData(data.userData);
                            break;
                        case 'SPECTATOR':
                            setSpectatorData(data.userData);
                            break;
                        default:
                            break;
                    }
                } else {
                    toast.success('sdchvskdbvdksb');
                    router.back();
                }
            } catch (error) {
                router.back();
                console.error('Error fetching live data:', error);
            }
        }
        getLiveData();
    }, [
        quizId,
        updateGameSession,
        updateQuiz,
        setCurrentUserType,
        setParticipants,
        setHostData,
        setParticipantData,
        setSpectatorData,
        setSpectators,
        setChatMessages,
        updateCurrentQuestion,
        router,
    ]);

    if (!quiz) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen select-none">
            <LiveUserRendererScreens />
        </div>
    );
}
