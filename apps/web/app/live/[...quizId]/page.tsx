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
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import axios from 'axios';
import { use, useCallback, useEffect } from 'react';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';
import LiveGameScreens from '@/components/quiz/live/LiveGameScreens';

export interface NewProps {
    params: Promise<{ quizId: string }>;
}

export default function New({ params }: NewProps) {
    const resolvedParams = use(params);
    const quizId = resolvedParams.quizId;

    const quiz = useLiveQuizStore((state) => state.quiz);
    const { subscribeToReconnect } = useWebSocket();

    // Pulls the authoritative snapshot of the session. Runs on first load (refresh) and again
    // every time the socket reconnects, because phase events published while offline are lost.
    const loadLiveData = useCallback(async () => {
        try {
            const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
                `${LIVE_QUIZ_DATA_URL}/${quizId}`,
                {
                    withCredentials: true,
                },
            );
            if (!response.success || !response.data) {
                // router.back();
                return;
            }
            const data = response.data;
            const liveQuizStore = useLiveQuizStore.getState();
            const participantsStore = useLiveParticipantsStore.getState();

            const questionChanged =
                liveQuizStore.currentQuestion?.id !== (data.currentQuestion?.id ?? undefined);
            if (questionChanged) {
                // drop what belonged to the question this client last saw
                useLiveQuizStore.setState({ currentQuestion: null });
                liveQuizStore.resetLiveResponses();
                liveQuizStore.clearLifelineData();
                participantsStore.resetResponse();
            }

            liveQuizStore.updateQuiz(data.quiz);
            liveQuizStore.updateGameSession(data.gameSession);
            useUserRoleStore.getState().setCurrentUserType(data.role);
            participantsStore.setParticipants(data.participants);
            useLiveSpectatorsStore.getState().setSpectators(data.spectators);
            useLiveQuizGlobalChatStore.getState().setChatMessages(data.messages || []);
            // if not found meand all questions asked
            if (data.currentQuestion) {
                liveQuizStore.updateCurrentQuestion(data.currentQuestion);
            }
            if (data.response) {
                participantsStore.setResponse(data.response);
            }
            if (data.responses) {
                participantsStore.setResponses(data.responses);
            }
            if (data.leaderboard) {
                useLeaderboardStore.getState().setTopLeaderboard(data.leaderboard.topScores);
                useLeaderboardStore.setState({
                    myRank: data.leaderboard.myRank,
                    myScore: data.leaderboard.myScore,
                    totalParticipants: data.leaderboard.totalParticipants,
                });
            }
            switch (data.role) {
                case USER_TYPE.HOST:
                    useLiveHostStore.getState().setHostData(data.userData as UserType);
                    break;
                case USER_TYPE.PARTICIPANT:
                    useLiveParticipantStore
                        .getState()
                        .setParticipantData(data.userData as ParticipantType);
                    break;
                case USER_TYPE.SPECTATOR:
                    useLiveSpectatorStore
                        .getState()
                        .setSpectatorData(data.userData as SpectatorType);
                    break;
                default:
                    break;
            }
        } catch (error) {
            // router.back();
            console.error('Error fetching live data:', error);
        }
    }, [quizId]);

    useEffect(() => {
        loadLiveData();
    }, [loadLiveData]);

    useEffect(() => {
        return subscribeToReconnect(() => {
            loadLiveData();
        });
    }, [subscribeToReconnect, loadLiveData]);

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
