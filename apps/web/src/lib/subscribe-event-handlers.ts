import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizGlobalChatStore } from '@/store/live-quiz/useLiveQuizGlobalChatStore';
import { useLiveQuizHostStore } from '@/store/live-quiz/useLiveQuizHostStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import {
    useLiveParticipantStore,
    useLiveSpectatorStore,
} from '@/store/live-quiz/useLiveQuizUserStore';
import { useLiveSpectatorsStore } from '@/store/live-quiz/useLiveSpectatorsStore';
import {
    ChatMessageType,
    ChatReactionType,
    GameSessionType,
    HostScreenEnum,
    ParticipantScreenEnum,
    ParticipantType,
    QuizPhaseEnum,
    QuizType,
    SpectatorScreenEnum,
    SpectatorType,
} from '@nocturn/types';
import { toast } from '@/lib/toast';

// FIX: Type guards for better type safety
const isParticipant = (payload: unknown): payload is ParticipantType => {
    return typeof payload === 'object' && payload !== null && 'id' in payload;
};

const isSpectator = (payload: unknown): payload is SpectatorType => {
    return typeof payload === 'object' && payload !== null && 'id' in payload;
};

export class SubscribeEventHandlers {
    // <---------------------- PARTICIPANT-EVENTS ---------------------->
    static handleIncomingMessage(payload: unknown) {
        if (!isParticipant(payload)) return;
        const { upsertParticipant } = useLiveParticipantsStore.getState();
        upsertParticipant(payload);
    }

    static handleIncomingNameChangeMessage(payload: unknown) {
        if (!isParticipant(payload)) return;
        const { upsertParticipant } = useLiveParticipantsStore.getState();
        const { updateParticipantData } = useLiveParticipantStore.getState();

        upsertParticipant({
            id: payload.id,
            nickname: payload.nickname,
            isNameChanged: true,
        } as ParticipantType);

        updateParticipantData({
            id: payload.id,
            nickname: payload.nickname,
            isNameChanged: true,
        } as ParticipantType);
    }

    static handleParticipantLeaveGameSession(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('userId' in payload)) return;
        const message = payload as { userId: string };

        const { participantData } = useLiveParticipantStore.getState();
        const { removeParticipant } = useLiveParticipantsStore.getState();
        removeParticipant(message.userId);
        if (message.userId === participantData?.id) participantData.isKicked = true;
    }

    // <---------------------- GAME-SESSION-EVENTS ---------------------->
    static handleIncomingQuestionPreviewPageChange(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            id: string;
            screen: SpectatorScreenEnum | ParticipantScreenEnum;
        };

        toast.success('Quiz started!');

        const { updateGameSession } = useLiveQuizStore.getState();
        updateGameSession({
            id: message.id,
            hostScreen: HostScreenEnum.QUESTION_PREVIEW,
            spectatorScreen: message.screen,
            participantScreen: message.screen,
        } as GameSessionType);
    }

    static handleIncomingQuestionAlreadyAskedEvent(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('error' in payload)) return;
        const message = payload as {
            error: string;
            questionId: string;
            questionIndex: number;
        };
        toast.error(message.error);
    }

    static handleIncomingQuizResultsPageChange(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
    }

    // <---------------------- SPECTATOR-EVENTS ---------------------->
    static handleSpectatorNameChangeMessage(payload: unknown) {
        if (!isSpectator(payload)) return;
        const { upsertSpectator } = useLiveSpectatorsStore.getState();
        const { updateSpectatorData } = useLiveSpectatorStore.getState();

        upsertSpectator({
            id: payload.id,
            nickname: payload.nickname,
            isNameChanged: true,
        } as SpectatorType);

        updateSpectatorData({
            id: payload.id,
            nickname: payload.nickname,
            isNameChanged: true,
        } as SpectatorType);
    }

    static handleSpectatorLeaveGameSession(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('userId' in payload)) return;
        const { userId } = payload as { userId: string };
        const { removeSpectator } = useLiveSpectatorsStore.getState();
        const { spectatorData } = useLiveSpectatorStore.getState();

        removeSpectator(userId);
        if (userId === spectatorData?.id) spectatorData.isKicked = true;
    }

    static handleSpectatorIncomingReadingPhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const readingPhasePayload = payload as {
            spectatorScreen: SpectatorScreenEnum;
            currentQuestionIndex: number;
            currentQuestionId: string;
            questionTitle: string;
            startTime: number;
            endTime: number;
            currentPhase: QuizPhaseEnum;
        };

        const { updateGameSession, updateCurrentQuestion, resetLiveResponses, clearLifelineData } =
            useLiveQuizStore.getState();

        resetLiveResponses();
        clearLifelineData();

        updateCurrentQuestion({
            id: readingPhasePayload.currentQuestionId,
            question: readingPhasePayload.questionTitle,
        });

        updateGameSession({
            spectatorScreen: readingPhasePayload.spectatorScreen,
            currentQuestionId: readingPhasePayload.currentQuestionId,
            currentQuestionIndex: readingPhasePayload.currentQuestionIndex,
            phaseStartTime: readingPhasePayload.startTime,
            phaseEndTime: readingPhasePayload.endTime,
            currentPhase: readingPhasePayload.currentPhase,
        });
    }

    static handleSpectatorIncomingActivePhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const activePhasePayload = payload as {
            spectatorScreen: SpectatorScreenEnum;
            startTime: number;
            endTime: number;
            questionOptions: string[];
        };

        const { updateCurrentQuestion, updateGameSession } = useLiveQuizStore.getState();

        updateCurrentQuestion({
            options: activePhasePayload.questionOptions,
        });

        updateGameSession({
            spectatorScreen: SpectatorScreenEnum.QUESTION_ACTIVE,
            currentPhase: QuizPhaseEnum.QUESTION_ACTIVE,
            phaseStartTime: activePhasePayload.startTime,
            phaseEndTime: activePhasePayload.endTime,
        });
    }

    static handleSpectatorIncomingResultsPhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const resultsPhasePayload = payload as {
            scores: {
                id: string;
                totalScore: number;
                finalRank: number;
                longestStreak: number;
            }[];
            responses: {
                id: string;
                participantId: string;
                isCorrect: boolean;
                selectedAnswer: number;
                pointsEarned: number;
            }[];
            correctAnswer: number;
            explanation: string;
            spectatorScreen: SpectatorScreenEnum;
            startTime: number;
        };

        const { updateGameSession, updateCurrentQuestion } = useLiveQuizStore.getState();
        const { updateParticipants, setResponses } = useLiveParticipantsStore.getState();

        updateParticipants(resultsPhasePayload.scores);
        setResponses(resultsPhasePayload.responses);

        updateCurrentQuestion({
            correctAnswer: resultsPhasePayload.correctAnswer,
            explanation: resultsPhasePayload.explanation,
        });

        updateGameSession({
            spectatorScreen: resultsPhasePayload.spectatorScreen,
            currentPhase: QuizPhaseEnum.SHOW_RESULTS,
            phaseStartTime: resultsPhasePayload.startTime,
        });
    }

    static handleIncomingHintEvents(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('hint' in payload)) return;
        const { hint } = payload as { hint: string };
        const { updateCurrentQuestion } = useLiveQuizStore.getState();
        updateCurrentQuestion({ hint });
    }

    static handleIncomingNewSpectator(payload: unknown) {
        if (!isSpectator(payload)) return;
        const { upsertSpectator } = useLiveSpectatorsStore.getState();
        upsertSpectator(payload);
    }

    // <---------------------- CHAT/INTERACTION-EVENTS ---------------------->
    static handleIncomingChatReactionMessage(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const { addChatReaction } = useLiveQuizGlobalChatStore.getState();
        const message = payload as ChatReactionType;
        addChatReaction(message);
    }

    static handleIncomingChatMessage(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('payload' in payload)) return;
        const { addChatMessage } = useLiveQuizGlobalChatStore.getState();
        const messagePayload = payload as { id: string; payload: ChatMessageType };
        const chat = messagePayload.payload;
        addChatMessage(chat);
    }

    static handleIncomingReactionEvent(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('payload' in payload)) return;
        const { addChatReaction } = useLiveQuizGlobalChatStore.getState();
        const reactionPayload = payload as { id: string; payload: ChatReactionType };
        const reaction = reactionPayload.payload;
        addChatReaction(reaction);
    }

    // <---------------------- HOST-PHASE-EVENTS ---------------------->
    static handleHostIncomingReadingPhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const readingPhasePayload = payload as {
            currentQuestionIndex: number;
            currentQuestionId: string;
            questionTitle: string;
            startTime: number;
            endTime: number;
            currentPhase: QuizPhaseEnum;
            hostScreen: HostScreenEnum;
        };

        const { updateGameSession } = useLiveQuizStore.getState();

        updateGameSession({
            hostScreen: readingPhasePayload.hostScreen,
            currentQuestionId: readingPhasePayload.currentQuestionId,
            currentQuestionIndex: readingPhasePayload.currentQuestionIndex,
            phaseStartTime: readingPhasePayload.startTime,
            phaseEndTime: readingPhasePayload.endTime,
        });
    }

    static handleHostIncomingActivePhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const activePhasePayload = payload as {
            questionOptions: string[];
            hostScreen: HostScreenEnum;
            startTime: number;
            endTime: number;
        };

        const { updateGameSession, updateCurrentQuestion } = useLiveQuizStore.getState();

        updateGameSession({
            hostScreen: activePhasePayload.hostScreen,
            phaseStartTime: activePhasePayload.startTime,
            phaseEndTime: activePhasePayload.endTime,
        });

        updateCurrentQuestion({
            options: activePhasePayload.questionOptions,
        });
    }

    static handleHostIncomingResultsPhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const resultsPhasePayload = payload as {
            scores: { id: string; totalScore: number }[];
            correctAnswer: number;
            hostScreen: HostScreenEnum;
            startTime: number;
        };

        const { updateParticipants } = useLiveParticipantsStore.getState();
        const { updateGameSession } = useLiveQuizStore.getState();

        updateParticipants(resultsPhasePayload.scores);

        updateGameSession({
            hostScreen: resultsPhasePayload.hostScreen,
        });
    }

    // <---------------------- PARTICIPANT-PHASE-EVENTS ---------------------->
    static handleParticipantIncomingReadingPhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const readingPhasePayload = payload as {
            currentQuestionIndex: number;
            currentQuestionId: string;
            questionTitle: string;
            startTime: number;
            endTime: number;
            currentPhase: QuizPhaseEnum;
            participantScreen: ParticipantScreenEnum;
        };

        // FIX: Batch state updates
        const { updateGameSession, updateCurrentQuestion, resetLiveResponses, clearLifelineData } =
            useLiveQuizStore.getState();

        resetLiveResponses();
        clearLifelineData();

        updateCurrentQuestion({
            id: readingPhasePayload.currentQuestionId,
            question: readingPhasePayload.questionTitle,
        });

        updateGameSession({
            participantScreen: readingPhasePayload.participantScreen,
            currentQuestionId: readingPhasePayload.currentQuestionId,
            currentQuestionIndex: readingPhasePayload.currentQuestionIndex,
            currentPhase: readingPhasePayload.currentPhase,
            phaseStartTime: readingPhasePayload.startTime,
            phaseEndTime: readingPhasePayload.endTime,
        });
    }

    static handleParticipantIncomingActivePhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const activePhasePayload = payload as {
            questionOptions: string[];
            participantScreen: string;
            startTime: number;
            endTime: number;
        };

        const { updateGameSession, updateCurrentQuestion } = useLiveQuizStore.getState();

        updateCurrentQuestion({
            options: activePhasePayload.questionOptions,
        });

        updateGameSession({
            participantScreen: ParticipantScreenEnum.QUESTION_ACTIVE,
            currentPhase: QuizPhaseEnum.QUESTION_ACTIVE,
            phaseStartTime: activePhasePayload.startTime,
            phaseEndTime: activePhasePayload.endTime,
        });
    }

    static handleParticipantIncomingResultsPhase(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const resultsPhasePayload = payload as {
            scores: {
                id: string;
                totalScore: number;
                finalRank: number;
                longestStreak: number;
            }[];
            responses: {
                id: string;
                participantId: string;
                isCorrect: boolean;
                selectedAnswer: number;
                pointsEarned: number;
            }[];
            correctAnswer: number;
            explanation: string;
            participantScreen: ParticipantScreenEnum;
            startTime: number;
        };

        const { updateGameSession, updateCurrentQuestion } = useLiveQuizStore.getState();
        const { updateParticipants, setResponses } = useLiveParticipantsStore.getState();

        updateParticipants(resultsPhasePayload.scores);
        setResponses(resultsPhasePayload.responses);

        updateCurrentQuestion({
            correctAnswer: resultsPhasePayload.correctAnswer,
            explanation: resultsPhasePayload.explanation,
        });

        updateGameSession({
            participantScreen: resultsPhasePayload.participantScreen,
            currentPhase: QuizPhaseEnum.SHOW_RESULTS,
            phaseStartTime: resultsPhasePayload.startTime,
        });
    }

    static handleHostLaunchQuestion() {
        // Empty handler - implement as needed
    }

    // <---------------------- RESPONSE-EVENTS ---------------------->
    static handleParticipantIncomingRespondedMessage(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('error' in payload)) return;
        const message = payload as { error: string };
        toast.warning(message.error);
    }

    static handleHostIncomingResponseMessage(payload: unknown) {
        if (typeof payload !== 'object' || payload === null || !('selectedAnswer' in payload))
            return;
        const message = payload as { selectedAnswer: number };

        const { updateLiveResponses } = useLiveQuizHostStore.getState();
        updateLiveResponses(message.selectedAnswer);

        const { updateLiveResponse } = useLiveQuizStore.getState();
        updateLiveResponse(message.selectedAnswer);
    }

    static handleSettingschange(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as QuizType;
        const { updateQuiz } = useLiveQuizStore.getState();
        updateQuiz(message);
    }

    // <---------------------- LIFELINE_EVENTS ---------------------->

    static handleSpectatorLifelineInvitation(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            questionId: string;
            expiresAt: number;
            participantCount?: number;
            status: string;
        };

        const { setActiveLifelineSession } = useLiveQuizStore.getState();

        setActiveLifelineSession({
            questionId: message.questionId,
            expiresAt: message.expiresAt,
            participantCount: message.participantCount,
            isActive: message.status === 'active',
        });

        toast.info('A participant needs help! Cast your vote.');
    }

    static handleLifelineResultToParticipant(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            mostPopularOption: number | null;
            totalResponses: number;
            questionId: string;
            optionBreakdown: number[];
            wasSuccessful: boolean;
        };

        const { setLifelineResult, setHasUsedLifeline } = useLiveQuizStore.getState();

        setLifelineResult({
            mostPopularOption: message.mostPopularOption,
            totalResponses: message.totalResponses,
            wasSuccessful: message.wasSuccessful,
            optionBreakdown: message.optionBreakdown,
        });

        setHasUsedLifeline(true);

        if (message.wasSuccessful && message.mostPopularOption !== null) {
            toast.success(
                `Spectators suggest: Option ${message.mostPopularOption + 1} (${message.totalResponses} votes)`,
                { duration: 5000 },
            );
        } else {
            toast.warning(`No clear consensus from spectators (${message.totalResponses} votes)`);
        }
    }

    static handleSpectatorLifelineResponseConfirmation(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            status: string;
            selectedOption: number;
        };

        if (message.status === 'recorded') {
            toast.success(`Your vote has been recorded: Option ${message.selectedOption + 1}`);
        }
    }

    static handleSpectatorLifelineResponse(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            questionId: string;
            spectatorId: string;
            selectedOption: number;
        };

        const { addLifelineVote } = useLiveQuizStore.getState();
        addLifelineVote(message.spectatorId, message.selectedOption);
    }

    static handleParticipantInitialLifelineStatus(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            hasUsedLifeline: boolean;
            status?: string;
            expiresAt?: number;
        };

        const { setHasUsedLifeline, setLifelineRequested } = useLiveQuizStore.getState();
        setHasUsedLifeline(message.hasUsedLifeline);

        if (message.status === 'requested' && message.expiresAt) {
            setLifelineRequested(true, message.expiresAt);
        }
    }

    static handleParticipantRequestLifelineConfirmation(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            hasUsedLifeline?: boolean;
            status?: string;
            expiresAt?: number;
            error?: string;
        };

        if (message.error) {
            toast.error(message.error);
            return;
        }

        const { setLifelineRequested } = useLiveQuizStore.getState();

        if (message.status === 'requested' && message.expiresAt) {
            setLifelineRequested(true, message.expiresAt);
            toast.success('Lifeline requested! Spectators are being asked to help...');
        }
    }

    static handleLifelineLiveUpdate(payload: unknown) {
        if (typeof payload !== 'object' || payload === null) return;
        const message = payload as {
            questionId: string;
            optionBreakdown: number[];
        };

        const { updateLifelineLiveVotes } = useLiveQuizStore.getState();
        updateLifelineLiveVotes(message.optionBreakdown);
    }
}
