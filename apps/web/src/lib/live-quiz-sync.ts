import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
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
import {
    CustomResponse,
    getLiveQuizDataResponse,
    ParticipantType,
    QuizPhaseEnum,
    SpectatorType,
    USER_TYPE,
    UserType,
} from '@nocturn/types';
import axios from 'axios';
import { LIVE_QUIZ_DATA_URL } from 'routes/api_routes';

/**
 * Fetches the authoritative live quiz snapshot from the server and writes it into the
 * live stores. Used on page load and after the socket reconnects, so that anyone who
 * refreshed or dropped off lands on the same screen (with results/leaderboard) as everyone else.
 */
export async function syncLiveQuizState(quizId: string, isInitialLoad: boolean = false) {
    try {
        const { data: response } = await axios.get<CustomResponse<getLiveQuizDataResponse>>(
            `${LIVE_QUIZ_DATA_URL}/${quizId}`,
            {
                withCredentials: true,
            },
        );
        if (!response.success || !response.data) return false;
        applyLiveQuizData(response.data, isInitialLoad);
        return true;
    } catch (error) {
        console.error('Error fetching live data:', error);
        return false;
    }
}

function applyLiveQuizData(data: getLiveQuizDataResponse, isInitialLoad: boolean) {
    const {
        gameSession: previousGameSession,
        updateQuiz,
        updateGameSession,
        updateCurrentQuestion,
        resetLiveResponses,
        clearLifelineData,
    } = useLiveQuizStore.getState();
    const { setParticipants, setResponse, resetResponse, setResponses } =
        useLiveParticipantsStore.getState();

    // a question that started while we were away must not inherit the previous one's state
    const questionChanged =
        previousGameSession?.currentQuestionId !== data.gameSession.currentQuestionId;

    updateQuiz(data.quiz);
    updateGameSession(data.gameSession);
    useUserRoleStore.getState().setCurrentUserType(data.role);
    setParticipants(data.participants);
    useLiveSpectatorsStore.getState().setSpectators(data.spectators);

    if (data.messages || isInitialLoad) {
        useLiveQuizGlobalChatStore.getState().setChatMessages(data.messages || []);
    }

    if (questionChanged && !isInitialLoad) {
        resetLiveResponses();
        clearLifelineData();
        resetResponse();
        updateCurrentQuestion(null);
    }

    // if not found means all questions asked
    if (data.currentQuestion) {
        updateCurrentQuestion({
            id: data.gameSession.currentQuestionId ?? undefined,
            ...data.currentQuestion,
        });
    }
    if (data.response) {
        setResponse(data.response);
    }

    if (data.leaderboard) {
        useLeaderboardStore.setState({
            topLeaderboard: data.leaderboard.topScores,
            totalParticipants: data.leaderboard.totalParticipants,
            myRank: data.leaderboard.myRank,
            myScore: data.leaderboard.myScore,
        });
    }
    if (data.gameSession.currentPhase === QuizPhaseEnum.SHOW_RESULTS) {
        setResponses(data.questionResponses ?? []);
    }

    switch (data.role) {
        case USER_TYPE.HOST:
            useLiveHostStore.getState().setHostData(data.userData as UserType);
            break;
        case USER_TYPE.PARTICIPANT:
            useLiveParticipantStore.getState().setParticipantData(data.userData as ParticipantType);
            break;
        case USER_TYPE.SPECTATOR:
            useLiveSpectatorStore.getState().setSpectatorData(data.userData as SpectatorType);
            break;
        default:
            break;
    }
}
