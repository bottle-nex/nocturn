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
import {
    CustomResponse,
    LiveQuizDataResponse,
    ParticipantType,
    SpectatorType,
    USER_TYPE,
    UserType,
} from '@nocturn/types';

import { useLiveSpectatorsStore } from '@/store/live-quiz/useLiveSpectatorsStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';

export interface NewProps {
    params: Promise<{
        quizId: string;
    }>;
}

export default function New({ params }: NewProps) {
    const { quizId } = use(params);
    const router = useRouter();

    const {
        quiz,
        updateQuiz,
        updateGameSession,
        updateCurrentQuestion,
        setIsNextQuestonAvailable,
    } = useLiveQuizStore();
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
                const { data: response } = await axios.get<CustomResponse<LiveQuizDataResponse>>(
                    `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                    {
                        withCredentials: true,
                    },
                );
                console.log('Live quiz data response:', response);
                if (response.success && response.data) {
                    const data = response.data;
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    setChatMessages(data.messages || []);
                    if (data.question) {
                        updateCurrentQuestion(data.question);
                    }
                    setIsNextQuestonAvailable(Boolean(data.isNextQuestionAvailable));
                    switch (data.role) {
                        case USER_TYPE.HOST:
                            setHostData(data.userData as UserType);
                            break;
                        case USER_TYPE.PARTICIPANT:
                            setParticipantData(data.userData as ParticipantType);
                            break;
                        case USER_TYPE.SPECTATOR:
                            setSpectatorData(data.userData as SpectatorType);
                            break;
                        default:
                            break;
                    }
                } else {
                    // router.back();
                }
            } catch (error) {
                // router.back();
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
        setIsNextQuestonAvailable,
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
