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
import axios from 'axios';
import { use, useEffect } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';
import LiveGameScreens from '@/components/quiz/live/LiveGameScreens';
import { getWebSocketClient } from '@/lib/singleton-socket';
import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';

export interface NewProps {
    params: Promise<{ quizId: string }>;
}

export default function New({ params }: NewProps) {
    const resolvedParams = use(params);
    const quizId = String(resolvedParams.quizId);

    const {
        quiz,
        updateQuiz,
        updateGameSession,
        updateCurrentQuestion,
        setAskedQuestionCount,
        setIsNextQuestonAvailable,
    } = useLiveQuizStore();
    const { setHostData } = useLiveHostStore();
    const { setParticipantData } = useLiveParticipantStore();
    const { setSpectatorData } = useLiveSpectatorStore();
    const { setCurrentUserType } = useUserRoleStore();
    const { setChatMessages } = useLiveQuizGlobalChatStore();
    const { setParticipants, setResponse, resetResponse } = useLiveParticipantsStore();
    const { setSpectators } = useLiveSpectatorsStore();

    useEffect(() => {
        let active = true;
        let requestId = 0;
        async function getLiveData() {
            const currentRequest = ++requestId;
            try {
                const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
                    `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                    {
                        withCredentials: true,
                    },
                );
                if (!active || currentRequest !== requestId) return;
                if (response.success && response.data) {
                    const data = response.data;
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    setChatMessages(data.messages || []);
                    // Replace the question so fields from a missed question cannot survive.
                    updateCurrentQuestion(null);
                    if (data.currentQuestion) updateCurrentQuestion(data.currentQuestion);
                    resetResponse();
                    if (data.response) setResponse(data.response);
                    const leaderboard = data.leaderboard;
                    useLeaderboardStore.setState({
                        topLeaderboard: leaderboard?.topScores ?? [],
                        totalParticipants: leaderboard?.totalParticipants ?? 0,
                        myRank: leaderboard?.myRank ?? null,
                        myScore: leaderboard?.myScore ?? null,
                    });
                    if (data.askedQuestionCount !== null) {
                        setAskedQuestionCount(data.askedQuestionCount);
                        setIsNextQuestonAvailable(
                            data.askedQuestionCount < (data.quiz._count?.questions ?? 0),
                        );
                    }
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
                }
            } catch (error) {
                console.error('Error fetching live data:', error);
            }
        }
        const socket = getWebSocketClient(quizId);
        const unsubscribe = socket.subscribe_to_open(getLiveData);
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
        resetResponse,
        setAskedQuestionCount,
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
