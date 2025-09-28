import { cleanWebSocketClient, getWebSocketClient } from '@/lib/singleton-socket';
import WebSocketClient, { MessagePayload } from '@/socket/socket';
import { MESSAGE_TYPES } from '@/types/web-socket-types';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const useWebSocket = () => {
    const socket = useRef<WebSocketClient | null>(null);
    const pathname = usePathname();
    const lastQuizIdRef = useRef<string | null>(null);

    useEffect(() => {
        const segments = pathname.split('/');
        const quizId = segments[segments.length - 1];

        if (!quizId || quizId === 'undefined' || quizId === '') {
            return;
        }
        if (lastQuizIdRef.current === quizId) {
            socket.current = getWebSocketClient(quizId);
            return;
        }
        lastQuizIdRef.current = quizId;
        socket.current = getWebSocketClient(quizId);
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

<<<<<<< HEAD
    function handleParticipantLeaveGameSession(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.PARTICIPANT_LEAVE_GAME_SESSION,
=======
    function handleParticipantRequestLifeline(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.PARTICIPANT_REQUEST_LIFELINE,
>>>>>>> bfe9373 (lifeline schema + lifeline most opted opn feat added)
            payload: payload,
        };
        if (socket.current) {
            socket.current.send_message(message);
        }
    }
<<<<<<< HEAD
    function handleSettingsChangeEvent(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.SETTINGS_CHANGE,
            payload: payload,
        };

=======

    function handleSpectatorLifelineResponse(payload: unknown) {
        const message: MessagePayload = {
            type: MESSAGE_TYPES.SPECTATOR_LIFELINE_RESPONSE,
            payload: payload,
        };
>>>>>>> bfe9373 (lifeline schema + lifeline most opted opn feat added)
        if (socket.current) {
            socket.current.send_message(message);
        }
    }

    return {
        subscribeToHandler,
        unsubscribeToHandler,
        socket: socket.current,
        isConnected: socket.current?.is_connected || false,
        handleParticipantNameChangeMessage,
        handleSpectatorNameChangeMessage,
        handleHostQuestionPreviewPageChange,
        handleSendInteractionMessage,
        handleSendChatMessage,
        handleSendChatReactionMessage,
        handleSendHostLaunchQuestion,
        handleParticipantResponseMessage,
        handleLaunchHintEvent,
<<<<<<< HEAD
        handleParticipantLeaveGameSession,
        handleSettingsChangeEvent,
=======
        handleParticipantRequestLifeline,
        handleSpectatorLifelineResponse,
>>>>>>> bfe9373 (lifeline schema + lifeline most opted opn feat added)
    };
};
