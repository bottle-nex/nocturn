import { cleanWebSocketClient, getWebSocketClient } from '@/lib/singleton-socket';
import WebSocketClient, { MessagePayload } from '@/socket/socket.client';
import { COLLABORATORS_MESSAGE_TYPE, MESSAGE_TYPES } from '@nocturn/types';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const useWebSocket = () => {
    const socket = useRef<WebSocketClient | null>(null);
    const pathname = usePathname();
    const lastQuizIdRef = useRef<string | null>(null);

    useEffect(() => {
        const segments = pathname.split('/');
        const quizId = segments[segments.length - 1];

        const gameSessionId = segments[segments.length - 1];

        if (!quizId || quizId === 'undefined' || quizId === '') {
            return;
        }
        if (lastQuizIdRef.current === quizId) {
            return;
        }
        lastQuizIdRef.current = quizId;
        // socket.current = getWebSocketClient(quizId);
        socket.current = getWebSocketClient(gameSessionId);
        return () => {
            if (lastQuizIdRef.current !== quizId) {
                cleanWebSocketClient();
                socket.current = null;
            }
        };
    }, [pathname]);

    function subscribeToHandler(type: string, handler: (payload: unknown) => void) {
        if (!socket.current) {
            console.warn('Attempting to subscribe but no socket connection available');
            return;
        }
        socket.current.subscribe_to_handlers(type, handler);
    }

    function unsubscribeToHandler(type: string, handler: (payload: unknown) => void) {
        if (!socket.current) {
            console.warn('Attempting to unsubscribe but no socket connection available');
            return;
        }
        socket.current.unsubscribe_to_handlers(type, handler);
    }

    function handleParticipantNameChangeMessage(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.PARTICIPANT_NAME_CHANGE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleSpectatorNameChangeMessage(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.SPECTATOR_NAME_CHANGE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleHostQuestionPreviewPageChange(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.HOST_CHANGE_QUESTION_PREVIEW,
            payload: payload,
        };

        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleSendInteractionMessage(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.INTERACTION_EVENT,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleSendChatReactionMessage(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.CHAT_REACTION_EVENT,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleSendChatMessage(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.CHAT_MESSAGE,
            payload: payload,
        };

        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleSendHostLaunchQuestion(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.HOST_LAUNCH_QUESTION,
            payload: payload,
        };

        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleUpdateCurrentQuestion(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.UPDATE_CURRENT_QUESTION,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleLaunchHintEvent(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.HOST_EMITS_HINT,
            payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleParticipantResponseMessage(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.PARTICIPANT_RESPONSE_MESSAGE,
            payload: payload,
        };

        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleParticipantLeaveGameSession(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleParticipantRequestLifeline(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleSettingsChangeEvent(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.SETTINGS_CHANGE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleSpectatorLifelineResponse(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleAddParticipantWarningCount(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.PARTICIPANT_WARNING_COUNT,
            payload: payload,
        };

        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleHostQuizResults(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.HOST_CHANGE_QUIZ_RESULTS,
            payload: payload,
        };

        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleCollaboratorsQuestionChange(payload: unknown) {
        const message: MessagePayload = {
            type: COLLABORATORS_MESSAGE_TYPE.QUESTION_CHANGE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleCollaboratorQuestionUpdate(payload: unknown) {
        const message: MessagePayload = {
            type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleCollaboratorQuizUpdate(payload: unknown) {
        const message: MessagePayload = {
            type: COLLABORATORS_MESSAGE_TYPE.QUIZ_UPDATE,
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    function handleAdvanceQuizEndScreen() {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.ADVANCE_QUIZ_END_SCREEN,
            payload: {},
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    return {
        socket: socket.current,
        isConnected: socket.current?.is_connected || false,
        subscribeToHandler,
        unsubscribeToHandler,
        handleParticipantNameChangeMessage,
        handleSpectatorNameChangeMessage,
        handleHostQuestionPreviewPageChange,
        handleSendInteractionMessage,
        handleSendChatMessage,
        handleSendChatReactionMessage,
        handleSendHostLaunchQuestion,
        handleUpdateCurrentQuestion,
        handleParticipantResponseMessage,
        handleLaunchHintEvent,
        handleParticipantLeaveGameSession,
        handleSettingsChangeEvent,
        handleAddParticipantWarningCount,
        handleParticipantRequestLifeline,
        handleSpectatorLifelineResponse,
        handleHostQuizResults,
        handleAdvanceQuizEndScreen,
        handleCollaboratorsQuestionChange,
        handleCollaboratorQuestionUpdate,
        handleCollaboratorQuizUpdate,
    };
};
