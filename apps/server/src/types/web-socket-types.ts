import { WebSocket } from 'ws';
import { QuizPhase } from '@nocturn/database';
import type { CollabSessionTokenPayload, LiveGameTokenPayload } from '@nocturn/types';

export interface CustomWebSocket extends WebSocket {
    id: string;
    user: LiveGameTokenPayload;
    collabUser: CollabSessionTokenPayload;
}

export interface PhaseQueueJobDataType {
    gameSessionId: string;
    questionId: string;
    questionIndex: number;
    fromPhase: QuizPhase;
    toPhase: QuizPhase;
    executeAt: Date;
}

export interface PhaseTransitionJob {
    gameSessionId: string;
    questionId: string;
    questionIndex: number;
    fromPhase: string;
    toPhase: string;
    executeAt: number;
}

export type {
    CookiePayload,
    PubSubMessageTypes,
    IncomingChatMessage,
    IncomingChatReaction,
    ChatMessageType,
    ChatReactionType,
    ParticipantNameChangeEvent,
    SpectatorNameChangeEvent,
} from '@nocturn/types';

// Re-export enums and constants (these are values, not just types)
export { MESSAGE_TYPES, USER_TYPE, ReactorType, InteractionEnum, SECONDS } from '@nocturn/types';

// Alias for backwards compatibility
export { InteractionEnum as Interactions } from '@nocturn/types';
