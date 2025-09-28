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
    GameSessionType,
    HostScreenEnum,
    ParticipantScreenEnum,
    ParticipantType,
    QuizPhaseEnum,
    QuizType,
    SpectatorScreenEnum,
    SpectatorType,
} from '@/types/prisma-types';
import { ChatMessageType, ChatReactionType } from '@/types/web-socket-types';
import { toast } from 'sonner';

export class SubscribeEventHandlers {
    // <---------------------- PARTICIPANT-EVENTS ---------------------->

    static handleIncomingMessage(payload: unknown) {
        const { upsertParticipant } = useLiveParticipantsStore.getState();
        upsertParticipant(payload as ParticipantType);
    }

    static handleIncomingNameChangeMessage(payload: unknown) {
        const { upsertParticipant } = useLiveParticipantsStore.getState();
        const { updateParticipantData } = useLiveParticipantStore.getState();

        const message = payload as ParticipantType;
        upsertParticipant({
            id: message.id,
            nickname: message.nickname,
            isNameChanged: true,
        } as ParticipantType);
        updateParticipantData({
            id: message.id,
            nickname: message.nickname,
            isNameChanged: true,
        } as ParticipantType);
    }

    static handleParticipantLeaveGameSession(payload: unknown) {
        const message = payload as { userId: string };

        const { removeParticipant } = useLiveParticipantsStore.getState();

        removeParticipant(message.userId);
    }

    // <---------------------- GAME-SESSION-EVENTS ---------------------->

    static handleIncomingQuestionPreviewPageChange(payload: unknown) {
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
        const message = payload as {
            error: string;
            questionId: string;
            questionIndex: number;
        };
        // toast should appear, currenlty not working
        toast.error(message.error);
    }

    // <---------------------- SPECTATOR-EVENTS ---------------------->

    static handleSpectatorNameChangeMessage(payload: unknown) {
        const { upsertSpectator } = useLiveSpectatorsStore.getState();
        const { updateSpectatorData } = useLiveSpectatorStore.getState();
        const message = payload as SpectatorType;

        upsertSpectator({
            id: message.id,
            nickname: message.nickname,
            isNameChanged: true,
        } as SpectatorType);
        updateSpectatorData({
            id: message.id,
            nickname: message.nickname,
            isNameChanged: true,
        } as SpectatorType);
    }

    static handleSpectatorLeaveGameSession(payload: unknown) {
        const { userId } = payload as {
            userId: string;
        };
        const { removeSpectator } = useLiveSpectatorsStore.getState();
        removeSpectator(userId);
    }

    // static handleSpectatorIncomingResultsPhase(payload: unknown) {
    //     const resultsPhasePayload = payload as {
    //         scores: { participantId: string; score: number }[];
    //         correctAnswer: number;
    //         spectatorScreen: SpectatorScreenEnum;
    //         startTime: number;
    //     };

    //     const { updateCurrentQuestion, updateGameSession } = useLiveQuizStore.getState();

    // }

    static handleSpectatorIncomingReadingPhase(payload: unknown) {
        const readingPhasePayload = payload as {
            spectatorScreen: SpectatorScreenEnum;
            currentQuestionIndex: number;
            currentQuestionId: string;
            questionTitle: string;
            startTime: number;
            endTime: number;
            currentPhase: QuizPhaseEnum;
        };

        const { updateGameSession, updateCurrentQuestion } = useLiveQuizStore.getState();

        updateCurrentQuestion({
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
        const { hint } = payload as {
            hint: string;
        };
        const { updateCurrentQuestion } = useLiveQuizStore.getState();
        updateCurrentQuestion({
            hint: hint,
        });
    }

    static handleIncomingNewSpectator(payload: unknown) {
        const { upsertSpectator } = useLiveSpectatorsStore.getState();
        upsertSpectator(payload as SpectatorType);
    }

    // <---------------------- CHAT/INTERACTION-EVENTS ---------------------->

    static handleIncomingChatReactionMessage(payload: unknown) {
        const { addChatReaction } = useLiveQuizGlobalChatStore.getState();
        const message = payload as ChatReactionType;

        addChatReaction(message);
    }

    static handleIncomingChatMessage(payload: unknown) {
        const { addChatMessage } = useLiveQuizGlobalChatStore.getState();
        const messagePayload = payload as { id: string; payload: ChatMessageType };
        const chat = messagePayload.payload;

        addChatMessage(chat);
    }

    static handleIncomingReactionEvent(payload: unknown) {
        const { addChatReaction } = useLiveQuizGlobalChatStore.getState();

        const reactionPayload = payload as { id: string; payload: ChatReactionType };
        const reaction = reactionPayload.payload;

        addChatReaction(reaction);
    }

    // <---------------------- HOST-PHASE-EVENTS ---------------------->

    static handleHostIncomingReadingPhase(payload: unknown) {
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
        const readingPhasePayload = payload as {
            currentQuestionIndex: number;
            currentQuestionId: string;
            questionTitle: string;
            startTime: number;
            endTime: number;
            currentPhase: QuizPhaseEnum;
            participantScreen: ParticipantScreenEnum;
        };

        const { updateGameSession, updateCurrentQuestion } = useLiveQuizStore.getState();

        updateCurrentQuestion({
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

    // static handleParticipantRequestLifeline(payload: unknown) {

    // }

    static handleHostLaunchQuestion() {}

    // <---------------------- RESPONSE-EVENTS ---------------------->

    static handleParticipantIncomingRespondedMessage(payload: unknown) {
        const message = payload as {
            error: string;
        };
        toast.warning(message.error);
    }

    static handleHostIncomingResponseMessage(payload: unknown) {
        const message = payload as {
            selectedAnswer: number;
        };

        const { updateLiveResponses } = useLiveQuizHostStore.getState();
        updateLiveResponses(message.selectedAnswer);
    }

    static handleSettingschange(payload: unknown) {
        const message = payload as QuizType;
        const { updateQuiz } = useLiveQuizStore.getState();
        updateQuiz(message);
    }

    // <---------------------- LIFELINE_EVENTS ---------------------->

    static handleSpectatorLifelineInvitation(payload: unknown) {
        const message = payload as {
            questionId: string;
            expiresAt: number;
            participantCount: number;
        };

        const { setActiveLifelineSession } = useLiveQuizStore.getState();

        setActiveLifelineSession({
            questionId: message.questionId,
            expiresAt: message.expiresAt,
            participantCount: message.participantCount,
            isActive: true,
        });

        toast.info(`Lifeline requested by ${message.participantCount} participants`);
    }

    static handleLifelineResultToParticipant(payload: unknown) {
        const message = payload as {
            mostPopularOption: number | null;
            totalResponses: number;
            questionId: string;
            optionBreakdown: { [key: number]: number };
            wasSuccessful: boolean;
        };

        const { setLifelineResult } = useLiveQuizStore.getState();
        setLifelineResult({
            mostPopularOption: message.mostPopularOption,
            totalResponses: message.totalResponses,
            wasSuccessful: message.wasSuccessful,
            optionBreakdown: message.optionBreakdown,
        });

        if (message.wasSuccessful) {
            toast.success(
                `Lifeline result: Option ${message.mostPopularOption! + 1} (${message.totalResponses} responses)`,
            );
        } else {
            toast.warning(`Lifeline inconclusive (${message.totalResponses} responses)`);
        }
    }

    static handleLifelineTimeout(payload: unknown) {
        const message = payload as {
            error: string;
        };
        toast.error(message.error);
    }

    static handleParticipantRequestLifelineConfirmation(payload: unknown) {
        const message = payload as {
            status: string;
            expiresAt: number;
            hasUsedLifeline?: boolean;
        };

        const { setLifelineRequested, setHasUsedLifeline } = useLiveQuizStore.getState();

        if (message.hasUsedLifeline !== undefined) {
            setHasUsedLifeline(message.hasUsedLifeline);
        }

        if (message.status === 'requested') {
            setLifelineRequested(true, message.expiresAt);
            toast.success('Lifeline requested! Waiting for spectator help...');
        }
    }

    static handleParticipantInitialLifelineStatus(payload: unknown) {
        const message = payload as {
            hasUsedLifeline: boolean;
            status?: string;
            expiresAt?: number;
        };

        const { setHasUsedLifeline, setLifelineRequested } = useLiveQuizStore.getState();

        if (message.hasUsedLifeline !== undefined) {
            setHasUsedLifeline(message.hasUsedLifeline);
        }

        if (message.status === 'requested' && message.expiresAt) {
            setLifelineRequested(true, message.expiresAt);
            toast.success('Lifeline requested! Waiting for spectator help...');
        }
    }

    static handleSpectatorLifelineResponseConfirmation(payload: unknown) {
        const message = payload as {
            status: string;
            selectedOption: number;
        };

        if (message.status === 'recorded') {
            toast.success(`Your lifeline response recorded: Option ${message.selectedOption + 1}`);
        }
    }

    static handleParticipantLifelineStatus(payload: unknown) {
        const { hasUsedLifeline } = payload as { hasUsedLifeline: boolean };
        const { setHasUsedLifeline } = useLiveQuizStore.getState();

        setHasUsedLifeline(hasUsedLifeline);
    }
}
