import { QuizPhase } from ".prisma/client";
import { WebSocket } from "ws";

export interface CustomWebSocket extends WebSocket {
  id: string;
  user: CookiePayload;
}

export interface CookiePayload {
  userId: string;
  quizId: string;
  gameSessionId: string;
  role: USER_TYPE;
  tokenId: string;
  iat: number;
  exp: number;
}

// export interface PubSubMessageTypes {
//     type: MESSAGE_TYPES;
//     payload: any;
//     exclude_socket_id?: string;
//     only_socket_id?: string;
// }

export type PubSubMessageTypes =
  | {
      type: MESSAGE_TYPES;
      payload: any;
      exclude_socket_id?: string;
      only_socket_id?: never;
    }
  | {
      type: MESSAGE_TYPES;
      payload: any;
      exclude_socket_id?: never;
      only_socket_id?: string;
    };

export enum Interactions {
  THUMBS_UP = "THUMBS_UP",
  DOLLAR = "DOLLAR",
  BULB = "BULB",
  HEART = "HEART",
  SMILE = "SMILE",
}

export enum ReactorType {
  HOST = "HOST",
  SPECTATOR = "SPECTATOR",
}

export enum MESSAGE_TYPES {
  HOST_JOIN_GAME_SESSION = "JOIN_GAME_SESSION",
  HOST_CHANGE_QUESTION_PREVIEW = "HOST_CHANGE_QUESTION_PREVIEW",
  HOST_LAUNCH_QUESTION = "HOST_LAUNCH_QUESTION",
  QUESTION_ALREADY_ASKED = "QUESTION_ALREADY_ASKED",

  PARTICIPANT_JOIN_GAME_SESSION = "PARTICIPANT_JOIN_GAME_SESSION",
  PARTICIPANT_NAME_CHANGE = "PARTICIPANT_NAME_CHANGE",
  PARTICIPANT_RESPONSE_MESSAGE = "PARTICIPANT_RESPONSE_MESSAGE",
  PARTICIPANT_RESPONDED_MESSAGE = "PARTICIPANT_RESPONDED_MESSAGE",

  SPECTATOR_JOIN_GAME_SESSION = "SPECTATOR_JOIN_GAME_SESSION",
  SPECTATOR_NAME_CHANGE = "SPECTATOR_NAME_CHANGE",

  CHAT_REACTION_EVENT = "CHAT_REACTION_EVENT",
  CHAT_MESSAGE = "CHAT_MESSAGE",

  INTERACTION_EVENT = "INTERACTION_EVENT",

  QUESTION_READING_PHASE_TO_PARTICIPANT = "QUESTION_READING_PHASE_TO_PARTICIPANT",
  QUESTION_READING_PHASE_TO_SPECTATOR = "QUESTION_READING_PHASE_TO_SPECTATOR",
  QUESTION_READING_PHASE_TO_HOST = "QUESTION_READING_PHASE_TO_HOST",

  QUESTION_ACTIVE_PHASE_TO_PARTICIPANT = "QUESTION_ACTIVE_PHASE_TO_PARTICIPANT",
  QUESTION_ACTIVE_PHASE_TO_SPECTATOR = "QUESTION_ACTIVE_PHASE_TO_SPECTATOR",
  QUESTION_ACTIVE_PHASE_TO_HOST = "QUESTION_ACTIVE_PHASE_TO_HOST",

  QUESTION_RESULTS_PHASE_TO_PARTICIPANT = "QUESTION_RESULTS_PHASE_TO_PARTICIPANT",
  QUESTION_RESULTS_PHASE_TO_SPECTATOR = "QUESTION_RESULTS_PHASE_TO_SPECTATOR",
  QUESTION_RESULTS_PHASE_TO_HOST = "QUESTION_RESULTS_PHASE_TO_HOST",
}

export enum USER_TYPE {
  HOST = "HOST",
  PARTICIPANT = "PARTICIPANT",
  SPECTATOR = "SPECTATOR",
}

export interface ParticipantNameChangeEvent {
  choosenNickname: string;
}

export interface SpectatorNameChangeEvent {
  choosenNickname: string;
}

export interface IncomingChatMessage {
  quizId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  repliedToId?: string;
}

export interface IncomingChatReaction {
  chatMessageId: string;
  reactorName: string;
  reactorAvatar: string;
  reaction: Interactions;
  reactedAt: Date;
  reactorType: ReactorType;
}

export type ChatMessageType = {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: Date;
  senderAvatar?: string | null;
  chatReactions: {
    reactorName: string;
    reactorAvatar: string;
    reaction: Interactions;
    reactedAt: Date;
    reactorType: ReactorType;
  }[];
};

export const SECONDS = 1000;

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
