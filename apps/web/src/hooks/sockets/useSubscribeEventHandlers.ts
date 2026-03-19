import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { COLLABORATORS_MESSAGE_TYPE, MESSAGE_TYPES } from '@nocturn/types';
import { SubscribeEventHandlers } from '@/lib/subscribe-event-handlers';
import CollaboratorsHandlers from '@/lib/collaborators.handlers';

export function useSubscribeEventHandlers() {
    const { subscribeToHandler, unsubscribeToHandler } = useWebSocket();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handlersMap: Record<string, (data: any) => void> = {
            [MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION]:
                SubscribeEventHandlers.handleIncomingMessage,
            [MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION]:
                SubscribeEventHandlers.handleParticipantLeaveGameSession,
            [MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE]:
                SubscribeEventHandlers.handleIncomingNameChangeMessage,
            [MESSAGE_TYPES.SPECTATOR_NAME_CHANGE]:
                SubscribeEventHandlers.handleSpectatorNameChangeMessage,
            [MESSAGE_TYPES.SPECTATOR_JOIN_GAME_SESSION]:
                SubscribeEventHandlers.handleIncomingNewSpectator,
            [MESSAGE_TYPES.HOST_EMITS_HINT]: SubscribeEventHandlers.handleIncomingHintEvents,
            [MESSAGE_TYPES.QUESTION_READING_PHASE_TO_SPECTATOR]:
                SubscribeEventHandlers.handleSpectatorIncomingReadingPhase,
            [MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_SPECTATOR]:
                SubscribeEventHandlers.handleSpectatorIncomingActivePhase,
            [MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_SPECTATOR]:
                SubscribeEventHandlers.handleSpectatorIncomingResultsPhase,
            [MESSAGE_TYPES.CHAT_REACTION_EVENT]:
                SubscribeEventHandlers.handleIncomingChatReactionMessage,
            [MESSAGE_TYPES.CHAT_MESSAGE]: SubscribeEventHandlers.handleIncomingChatMessage,
            [MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW]:
                SubscribeEventHandlers.handleIncomingQuestionPreviewPageChange,
            [MESSAGE_TYPES.HOST_LAUNCH_QUESTION]: SubscribeEventHandlers.handleHostLaunchQuestion,
            [MESSAGE_TYPES.QUESTION_READING_PHASE_TO_HOST]:
                SubscribeEventHandlers.handleHostIncomingReadingPhase,
            [MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_HOST]:
                SubscribeEventHandlers.handleHostIncomingActivePhase,
            [MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_HOST]:
                SubscribeEventHandlers.handleHostIncomingResultsPhase,
            [MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT]:
                SubscribeEventHandlers.handleParticipantIncomingReadingPhase,
            [MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_PARTICIPANT]:
                SubscribeEventHandlers.handleParticipantIncomingActivePhase,
            [MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_PARTICIPANT]:
                SubscribeEventHandlers.handleParticipantIncomingResultsPhase,
            [MESSAGE_TYPES.QUESTION_ALREADY_ASKED]:
                SubscribeEventHandlers.handleIncomingQuestionAlreadyAskedEvent,
            [MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE]:
                SubscribeEventHandlers.handleHostIncomingResponseMessage,
            [MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE]:
                SubscribeEventHandlers.handleParticipantIncomingRespondedMessage,
            [MESSAGE_TYPES.SETTINGS_CHANGE]: SubscribeEventHandlers.handleSettingschange,
            [MESSAGE_TYPES.PARTICIPANT_INDIVIDUAL_RANK]:
                SubscribeEventHandlers.handleParticipantIndividualRank,
            [MESSAGE_TYPES.SPECTATOR_LEAVE_GAME_SESSION]:
                SubscribeEventHandlers.handleSpectatorLeaveGameSession,
            [MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION]:
                SubscribeEventHandlers.handleSpectatorLifelineInvitation,
            [MESSAGE_TYPES.LIFELINE_RESULT_TO_PARTICIPANT]:
                SubscribeEventHandlers.handleLifelineResultToParticipant,
            [MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE]:
                SubscribeEventHandlers.handleParticipantRequestLifelineConfirmation,
            [MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE]:
                SubscribeEventHandlers.handleSpectatorLifelineResponse,
            [MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE_CONFIRMATION]:
                SubscribeEventHandlers.handleSpectatorLifelineResponseConfirmation,
            [MESSAGE_TYPES.LIFELINE_LIVE_UPDATE]: SubscribeEventHandlers.handleLifelineLiveUpdate,

            [MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS]:
                SubscribeEventHandlers.handleIncomingQuizResultsPageChange,
            [MESSAGE_TYPES.ADVANCE_QUIZ_END_SCREEN]:
                SubscribeEventHandlers.handleIncomingQuizResultsPageChange,

            [COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE]:
                CollaboratorsHandlers.handleIncomingQuestionTap,
            [COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE]:
                CollaboratorsHandlers.handleIncomingQuestionUpdate,
            [COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE]:
                CollaboratorsHandlers.handleIncomingQuizUpdate,
        };

        // susbcribe
        Object.entries(handlersMap).forEach(([type, handler]) => {
            subscribeToHandler(type, handler);
        });

        // unsubscribe
        return () => {
            Object.entries(handlersMap).forEach(([type, handler]) => {
                unsubscribeToHandler(type, handler);
            });
        };
    }, [subscribeToHandler, unsubscribeToHandler]);
}
