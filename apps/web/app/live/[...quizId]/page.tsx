'use client';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizGlobalChatStore } from '@/store/live-quiz/useLiveQuizGlobalChatStore';
import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import {
    useLiveHostStore,
    useLiveParticipantStore,
    useLiveSpectatorStore,
    useUserRoleStore,
} from '@/store/live-quiz/useLiveQuizUserStore';
import { useSocketConnectionStore } from '@/store/socket.actions/useSocketConnectionStore';
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
import { useCallback, use, useEffect, useRef } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';
import LiveGameScreens from '@/components/quiz/live/LiveGameScreens';

export interface NewProps {
    params: Promise<{ quizId: string }>;
}

export default function New({ params }: NewProps) {
    const resolvedParams = use(params);
    const quizId = resolvedParams.quizId;

    const { quiz, updateQuiz, updateGameSession, updateCurrentQuestion } = useLiveQuizStore();
    const { setHostData } = useLiveHostStore();
    const { setParticipantData } = useLiveParticipantStore();
    const { setSpectatorData } = useLiveSpectatorStore();
    const { setCurrentUserType } = useUserRoleStore();
    const { setChatMessages } = useLiveQuizGlobalChatStore();
    const { setParticipants, setResponse } = useLiveParticipantsStore();
    const { setSpectators } = useLiveSpectatorsStore();
    const { setTopLeaderboard, setMyRank } = useLeaderboardStore();
    const connectionGeneration = useSocketConnectionStore((state) => state.connectionGeneration);

    const lastSyncedAtRef = useRef(0);

    const getLiveData = useCallback(
        async function getLiveData() {
            lastSyncedAtRef.current = Date.now();
            try {
                const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
                    `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                    {
                        withCredentials: true,
                    },
                );
                if (response.success && response.data) {
                    const data = response.data;
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    if (data.messages) {
                        setChatMessages(data.messages);
                    }
                    // if not found meand all questions asked
                    if (data.currentQuestion) {
                        updateCurrentQuestion(data.currentQuestion);
                    }
                    if (data.response) {
                        setResponse(data.response);
                    }
                    if (data.topScores) {
                        setTopLeaderboard(data.topScores);
                    }
                    if (data.role === USER_TYPE.PARTICIPANT && data.myRank != null) {
                        setMyRank(data.myRank, data.myScore ?? 0, data.totalParticipants ?? 0);
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
        },
        [
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
            setResponse,
            setTopLeaderboard,
            setMyRank,
        ],
    );

    useEffect(() => {
        getLiveData();
    }, [getLiveData]);

    // Re-sync the live state whenever the websocket (re)connects so a player,
    // host or spectator that refreshed or lost connection lands on the screen
    // everyone else is on. A connection that opens right after the initial
    // fetch above is skipped so a normal page load does not fetch twice.
    useEffect(() => {
        if (connectionGeneration === 0) return;
        if (Date.now() - lastSyncedAtRef.current < 2000) return;
        getLiveData();
    }, [connectionGeneration, getLiveData]);

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
