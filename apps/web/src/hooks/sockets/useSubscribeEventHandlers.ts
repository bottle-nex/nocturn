import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { MESSAGE_TYPES } from '@/types/web-socket-types';
import { SubscribeEventHandlers } from '@/lib/subscribe-event-handlers';

export function useSubscribeEventHandlers() {
    const { subscribeToHandler, unsubscribeToHandler } = useWebSocket();

    useEffect(() => {
        subscribeToHandler(
            MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION,
            SubscribeEventHandlers.handleIncomingMessage,
        );

        subscribeToHandler(
            MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION,
            SubscribeEventHandlers.handleParticipantLeaveGameSession,
        );

        subscribeToHandler(
            MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE,
            SubscribeEventHandlers.handleIncomingNameChangeMessage,
        );

        subscribeToHandler(
            MESSAGE_TYPES.SPECTATOR_NAME_CHANGE,
            SubscribeEventHandlers.handleSpectatorNameChangeMessage,
        );
        subscribeToHandler(
            MESSAGE_TYPES.SPECTATOR_JOIN_GAME_SESSION,
            SubscribeEventHandlers.handleIncomingNewSpectator,
        );

        subscribeToHandler(
            MESSAGE_TYPES.HOST_EMITS_HINT,
            SubscribeEventHandlers.handleIncomingHintEvents,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_READING_PHASE_TO_SPECTATOR,
            SubscribeEventHandlers.handleSpectatorIncomingReadingPhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_SPECTATOR,
            SubscribeEventHandlers.handleSpectatorIncomingActivePhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_SPECTATOR,
            SubscribeEventHandlers.handleSpectatorIncomingResultsPhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.CHAT_REACTION_EVENT,
            SubscribeEventHandlers.handleIncomingChatReactionMessage,
        );
        subscribeToHandler(
            MESSAGE_TYPES.CHAT_MESSAGE,
            SubscribeEventHandlers.handleIncomingChatMessage,
        );

        subscribeToHandler(
            MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW,
            SubscribeEventHandlers.handleIncomingQuestionPreviewPageChange,
        );
        subscribeToHandler(
            MESSAGE_TYPES.HOST_LAUNCH_QUESTION,
            SubscribeEventHandlers.handleHostLaunchQuestion,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_READING_PHASE_TO_HOST,
            SubscribeEventHandlers.handleHostIncomingReadingPhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_HOST,
            SubscribeEventHandlers.handleHostIncomingActivePhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_HOST,
            SubscribeEventHandlers.handleHostIncomingResultsPhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT,
            SubscribeEventHandlers.handleParticipantIncomingReadingPhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_PARTICIPANT,
            SubscribeEventHandlers.handleParticipantIncomingActivePhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_PARTICIPANT,
            SubscribeEventHandlers.handleParticipantIncomingResultsPhase,
        );

        subscribeToHandler(
            MESSAGE_TYPES.QUESTION_ALREADY_ASKED,
            SubscribeEventHandlers.handleIncomingQuestionAlreadyAskedEvent,
        );

        subscribeToHandler(
            MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE,
            SubscribeEventHandlers.handleHostIncomingResponseMessage,
        );

        subscribeToHandler(
            MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE,
            SubscribeEventHandlers.handleParticipantIncomingRespondedMessage,
        );

        subscribeToHandler(
            MESSAGE_TYPES.SETTINGS_CHANGE,
            SubscribeEventHandlers.handleSettingschange,
        );

        subscribeToHandler(
            MESSAGE_TYPES.SPECTATOR_LEAVE_GAME_SESSION,
            SubscribeEventHandlers.handleSpectatorLeaveGameSession,
        );
        // lifeline events
        subscribeToHandler(
            MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION,
            SubscribeEventHandlers.handleSpectatorLifelineInvitation,
        );

        subscribeToHandler(
            MESSAGE_TYPES.LIFELINE_RESULT_TO_PARTICIPANT,
            SubscribeEventHandlers.handleLifelineResultToParticipant,
        );

        subscribeToHandler(
            MESSAGE_TYPES.LIFELINE_TIMEOUT,
            SubscribeEventHandlers.handleLifelineTimeout,
        );

        subscribeToHandler(
            MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
            SubscribeEventHandlers.handleParticipantRequestLifelineConfirmation,
        );

        subscribeToHandler(
            MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE,
            SubscribeEventHandlers.handleSpectatorLifelineResponseConfirmation,
        );

        subscribeToHandler(
            MESSAGE_TYPES.PARTICIPANT_LIFELINE_STATUS,
            SubscribeEventHandlers.handleParticipantLifelineStatus,
        );

        return () => {
            unsubscribeToHandler(
                MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION,
                SubscribeEventHandlers.handleIncomingMessage,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION,
                SubscribeEventHandlers.handleParticipantLeaveGameSession,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE,
                SubscribeEventHandlers.handleIncomingNameChangeMessage,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.SPECTATOR_NAME_CHANGE,
                SubscribeEventHandlers.handleSpectatorNameChangeMessage,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.SPECTATOR_JOIN_GAME_SESSION,
                SubscribeEventHandlers.handleIncomingNewSpectator,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_READING_PHASE_TO_SPECTATOR,
                SubscribeEventHandlers.handleSpectatorIncomingReadingPhase,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_SPECTATOR,
                SubscribeEventHandlers.handleSpectatorIncomingActivePhase,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_SPECTATOR,
                SubscribeEventHandlers.handleSpectatorIncomingResultsPhase,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.CHAT_REACTION_EVENT,
                SubscribeEventHandlers.handleIncomingChatReactionMessage,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.CHAT_MESSAGE,
                SubscribeEventHandlers.handleIncomingChatMessage,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW,
                SubscribeEventHandlers.handleIncomingQuestionPreviewPageChange,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.HOST_LAUNCH_QUESTION,
                SubscribeEventHandlers.handleHostLaunchQuestion,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_READING_PHASE_TO_HOST,
                SubscribeEventHandlers.handleHostIncomingReadingPhase,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_HOST,
                SubscribeEventHandlers.handleHostIncomingActivePhase,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_HOST,
                SubscribeEventHandlers.handleHostIncomingResultsPhase,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_READING_PHASE_TO_PARTICIPANT,
                SubscribeEventHandlers.handleParticipantIncomingReadingPhase,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_PARTICIPANT,
                SubscribeEventHandlers.handleParticipantIncomingActivePhase,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_PARTICIPANT,
                SubscribeEventHandlers.handleParticipantIncomingResultsPhase,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.QUESTION_ALREADY_ASKED,
                SubscribeEventHandlers.handleIncomingQuestionAlreadyAskedEvent,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE,
                SubscribeEventHandlers.handleHostIncomingResponseMessage,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.PARTICIPANT_RESPONDED_MESSAGE,
                SubscribeEventHandlers.handleParticipantIncomingRespondedMessage,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.HOST_EMITS_HINT,
                SubscribeEventHandlers.handleIncomingHintEvents,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.SETTINGS_CHANGE,
                SubscribeEventHandlers.handleSettingschange,
            );
            unsubscribeToHandler(
                MESSAGE_TYPES.SPECTATOR_LEAVE_GAME_SESSION,
                SubscribeEventHandlers.handleSpectatorLeaveGameSession,
            );
            
            unsubscribeToHandler(
                MESSAGE_TYPES.SPECTATOR_LIFELINE_INVITATION,
                SubscribeEventHandlers.handleSpectatorLifelineInvitation,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.LIFELINE_RESULT_TO_PARTICIPANT,
                SubscribeEventHandlers.handleLifelineResultToParticipant,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.LIFELINE_TIMEOUT,
                SubscribeEventHandlers.handleLifelineTimeout,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
                SubscribeEventHandlers.handleParticipantRequestLifelineConfirmation,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE,
                SubscribeEventHandlers.handleSpectatorLifelineResponseConfirmation,
            );

            unsubscribeToHandler(
                MESSAGE_TYPES.PARTICIPANT_LIFELINE_STATUS,
                SubscribeEventHandlers.handleParticipantLifelineStatus,
            );
        };
    }, [subscribeToHandler, unsubscribeToHandler]);
}
