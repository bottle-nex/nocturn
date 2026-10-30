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
import { getWebSocketClient } from '@/lib/singleton-socket';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
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
    const pathname = usePathname();

    const {
        quiz,
        updateQuiz,
        updateGameSession,
        updateCurrentQuestion,
        setIsNextQuestonAvailable,
        setAlreadyResponded,
    } = useLiveQuizStore();
    const { setHostData } = useLiveHostStore();
    const { setParticipantData } = useLiveParticipantStore();
    const { setSpectatorData } = useLiveSpectatorStore();
    const { setCurrentUserType } = useUserRoleStore();
    const { setChatMessages } = useLiveQuizGlobalChatStore();
    const { setParticipants, setResponse, setResponses, resetResponse } =
        useLiveParticipantsStore();
    const { setSpectators } = useLiveSpectatorsStore();

    useEffect(() => {
        let cancelled = false;

        async function getLiveData(isResync: boolean) {
            try {
                const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
                    `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                    {
                        withCredentials: true,
                    },
                );
                if (cancelled) return;
                if (response.success && response.data) {
                    const data = response.data;
                    updateQuiz(data.quiz);
                    updateGameSession(data.gameSession);
                    setCurrentUserType(data.role);
                    setParticipants(data.participants);
                    setSpectators(data.spectators);
                    // the cached path carries no chat history, keep what we have on a resync
                    if (!isResync || data.messages) {
                        setChatMessages(data.messages || []);
                    }
                    // if not found meand all questions asked
                    if (data.currentQuestion) {
                        // replace rather than merge so fields of an earlier question do not linger
                        updateCurrentQuestion(null);
                        updateCurrentQuestion(data.currentQuestion);
                    }
                    if (data.response) {
                        setResponse(data.response);
                    } else if (isResync) {
                        resetResponse();
                    }
                    if (data.leaderboard) {
                        useLeaderboardStore.setState({
                            topLeaderboard: data.leaderboard.topScores,
                            myRank: data.leaderboard.myRank,
                            myScore: data.leaderboard.myScore,
                            totalParticipants: data.leaderboard.totalParticipants,
                        });
                    }
                    if (data.questionResponses) {
                        setResponses(data.questionResponses);
                    }
                    // setIsNextQuestonAvailable(Boolean(data.isNextQuestionAvailable));
                    switch (data.role) {
                        case USER_TYPE.HOST:
                            setHostData(data.userData as UserType);
                            break;
                        case USER_TYPE.PARTICIPANT:
                            setParticipantData(data.userData as ParticipantType);
                            setAlreadyResponded(Boolean(data.response));
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

        // events broadcast while the socket was down are never replayed, so pull the
        // current state again once it is back
        const segments = pathname.split('/');
        const socketQuizId = segments[segments.length - 1];
        const unsubscribeReconnect = socketQuizId
            ? getWebSocketClient(socketQuizId).on_reconnect(() => getLiveData(true))
            : undefined;

        return () => {
            cancelled = true;
            unsubscribeReconnect?.();
        };
    }, [
        quizId,
        pathname,
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
        setResponses,
        resetResponse,
        setAlreadyResponded,
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
