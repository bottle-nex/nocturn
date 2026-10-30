'use client';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
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
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';
import LiveGameScreens from '@/components/quiz/live/LiveGameScreens';
import { onWebSocketReconnect } from '@/lib/singleton-socket';

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
        resetLiveResponses,
        clearLifelineData,
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
        async function getLiveData(isResync = false) {
            try {
                const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
                    `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                    {
                        withCredentials: true,
                    },
                );
                if (response.success && response.data) {
                    const data = response.data;
                    const previousQuestionId = useLiveQuizStore.getState().currentQuestion?.id;
                    if (previousQuestionId && previousQuestionId !== data.currentQuestion?.id) {
                        resetLiveResponses();
                        clearLifelineData();
                    }
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    // the cached path sends no messages; keep the chat we already have on resync
                    if (!isResync || data.messages) {
                        setChatMessages(data.messages || []);
                    }
                    // replace rather than merge, so fields of an earlier phase don't linger
                    updateCurrentQuestion(null);
                    // if not found meand all questions asked
                    if (data.currentQuestion) {
                        updateCurrentQuestion(data.currentQuestion);
                    }
                    if (data.response) {
                        setResponse(data.response);
                    } else {
                        resetResponse();
                    }
                    setResponses(data.responses ?? []);
                    if (data.leaderboard) {
                        setTopLeaderboard(data.leaderboard.topScores);
                        setMyRank(
                            data.leaderboard.myRank,
                            data.leaderboard.myScore,
                            data.leaderboard.totalParticipants,
                        );
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
        getLiveData();
        // the socket missed whatever was published while it was down, so fetch the state again
        return onWebSocketReconnect(() => getLiveData(true));
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
        resetLiveResponses,
        clearLifelineData,
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
