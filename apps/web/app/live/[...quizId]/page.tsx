'use client';
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
    getLiveQuizDataResponse,
    ParticipantType,
    SpectatorType,
    USER_TYPE,
    UserType,
} from '@nocturn/types';

import { useLiveSpectatorsStore } from '@/store/live-quiz/useLiveSpectatorsStore';
import { getWebSocketClient } from '@/lib/singleton-socket';
import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';
import LiveGameScreens from '@/components/quiz/live/LiveGameScreens';

export interface NewProps {
    params: Promise<{ quizId: string[] }>;
}

export default function New({ params }: NewProps) {
    const resolvedParams = use(params);
    const quizId = resolvedParams.quizId[0] ?? '';
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
    const { setParticipants, setResponse } = useLiveParticipantsStore();
    const { setSpectators } = useLiveSpectatorsStore();

    useEffect(() => {
        const client = getWebSocketClient(quizId);
        let active = true;
        let requestId = 0;
        async function getLiveData() {
            const currentRequest = ++requestId;
            const previousSession = useLiveQuizStore.getState().gameSession;
            try {
                const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
                    `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                    {
                        withCredentials: true,
                    },
                );
                // Phase messages received during the request take precedence over its snapshot.
                if (!active || currentRequest !== requestId) return;
                if (useLiveQuizStore.getState().gameSession !== previousSession) return;
                if (response.success && response.data) {
                    const data = response.data;
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    if (data.messages) setChatMessages(data.messages);
                    // Remove fields left over from the previous question before restoring state.
                    useLiveQuizStore.setState({ currentQuestion: null });
                    if (data.currentQuestion) {
                        updateCurrentQuestion(data.currentQuestion);
                    }
                    useLiveParticipantsStore.getState().resetResponse();
                    if (data.response) {
                        setResponse(data.response);
                    }
                    useLiveQuizStore.getState().setAlreadyResponded(Boolean(data.response));
                    if (data.askedQuestionCount !== null) {
                        useLiveQuizStore.getState().setAskedQuestionCount(data.askedQuestionCount);
                    }
                    useLeaderboardStore.setState({
                        topLeaderboard: data.topScores,
                        totalParticipants: data.totalParticipants,
                        myRank: data.myRank,
                        myScore: data.myScore,
                    });
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
        const unsubscribe = client.subscribe_to_connection(getLiveData);
        void getLiveData();
        return () => {
            active = false;
            unsubscribe();
        };
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
        setResponse,
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
            <LiveGameScreens />
        </div>
    );
}
