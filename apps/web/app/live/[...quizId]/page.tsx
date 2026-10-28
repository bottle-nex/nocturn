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
import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
import { SOCKET_RECONNECTED_EVENT } from '@/socket/socket.client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';
import LiveGameScreens from '@/components/quiz/live/LiveGameScreens';

export interface NewProps {
    params: Promise<{ quizId: string }>;
}

export default function New({ params }: NewProps) {
    const resolvedParams = use(params);
    const quizId = resolvedParams.quizId;
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
    const { setParticipants, setResponse, resetResponse, setResponses } =
        useLiveParticipantsStore();
    const { setSpectators } = useLiveSpectatorsStore();

    const { setTopLeaderboard, setMyRank } = useLeaderboardStore();

    useEffect(() => {
        async function getLiveData(isResync: boolean) {
            try {
                const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
                    `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                    {
                        withCredentials: true,
                    },
                );
                if (response.success && response.data) {
                    const data = response.data;
                    const previousQuestionId =
                        useLiveQuizStore.getState().gameSession?.currentQuestionId;
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    // the cache path does not return chats; keep the ones already loaded
                    if (!isResync || data.messages) {
                        setChatMessages(data.messages || []);
                    }
                    // the store merges question fields, so drop the stale question first
                    // when we missed a question change while disconnected
                    if (isResync) {
                        useLiveQuizStore.setState({ currentQuestion: null });
                        if (previousQuestionId !== data.gameSession.currentQuestionId) {
                            const { resetLiveResponses, clearLifelineData } =
                                useLiveQuizStore.getState();
                            resetLiveResponses();
                            clearLifelineData();
                        }
                    }
                    // if not found meand all questions asked
                    if (data.currentQuestion) {
                        updateCurrentQuestion({
                            ...(data.gameSession.currentQuestionId && {
                                id: data.gameSession.currentQuestionId,
                            }),
                            ...data.currentQuestion,
                        });
                    }
                    if (data.response) {
                        setResponse(data.response);
                    } else if (isResync) {
                        resetResponse();
                    }
                    if (data.responses) {
                        setResponses(data.responses);
                    }
                    if (data.leaderboard) {
                        const { topScores, totalParticipants, myRank, myScore } = data.leaderboard;
                        setTopLeaderboard(topScores);
                        if (myRank !== null) {
                            setMyRank(myRank, myScore ?? 0, totalParticipants);
                        }
                    }
                    // setIsNextQuestonAvailable(Boolean(data.isNextQuestionAvailable));
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
        getLiveData(false);

        // phase events broadcast while the socket was down are never replayed, so pull the
        // current state again instead of waiting for the next phase change
        const handleReconnect = () => getLiveData(true);
        window.addEventListener(SOCKET_RECONNECTED_EVENT, handleReconnect);
        return () => window.removeEventListener(SOCKET_RECONNECTED_EVENT, handleReconnect);
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
        resetResponse,
        setResponses,
        setTopLeaderboard,
        setMyRank,
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
