import { CollabRole, InteractionEnum, USER_TYPE } from "../prisma/schemas.prisma";

export enum MESSAGE_TYPES {
  HOST_JOIN_GAME_SESSION = "JOIN_GAME_SESSION",
  HOST_CHANGE_QUESTION_PREVIEW = "HOST_CHANGE_QUESTION_PREVIEW",
  HOST_LAUNCH_QUESTION = "HOST_LAUNCH_QUESTION",
  HOST_EMITS_HINT = "HOST_EMITS_HINT",
  HOST_CHANGE_QUIZ_RESULTS = "HOST_CHANGE_QUIZ_RESULTS",
  QUESTION_ALREADY_ASKED = "QUESTION_ALREADY_ASKED",

  PARTICIPANT_JOIN_GAME_SESSION = "PARTICIPANT_JOIN_GAME_SESSION",
  PARTICIPANT_NAME_CHANGE = "PARTICIPANT_NAME_CHANGE",
  PARTICIPANT_RESPONSE_MESSAGE = "PARTICIPANT_RESPONSE_MESSAGE",
  PARTICIPANT_RESPONDED_MESSAGE = "PARTICIPANT_RESPONDED_MESSAGE",
  PARTICIPANT_LEAVE_GAME_SESSION = "PARTICIPANT_LEAVE_GAME_SESSION",
  PARTICIPANT_REQUEST_LIFELINE = "PARTICIPANT_REQUEST_LIFELINE",
  PARTICIPANT_LIFELINE_STATUS = "PARTICIPANT_LIFELINE_STATUS",
  PARTICIPANT_WARNING_COUNT = "PARTICIPANT_WARNING_COUNT",

  SPECTATOR_LIFELINE_INVITATION = "SPECTATOR_LIFELINE_INVITATION",
  SPECTATOR_LIFELINE_RESPONSE = "SPECTATOR_LIFELINE_RESPONSE",
  SPECTATOR_LIFELINE_RESPONSE_CONFIRMATION = "SPECTATOR_LIFELINE_RESPONSE_CONFIRMATION",
  SPECTATOR_JOIN_GAME_SESSION = "SPECTATOR_JOIN_GAME_SESSION",
  SPECTATOR_NAME_CHANGE = "SPECTATOR_NAME_CHANGE",
  SPECTATOR_LEAVE_GAME_SESSION = "SPECTATOR_LEAVE_GAME_SESSION",
  LIFELINE_LIVE_UPDATE = "LIFELINE_LIVE_UPDATE",

  LIFELINE_TIMEOUT = "LIFELINE_TIMEOUT",
  LIFELINE_RESULT_TO_PARTICIPANT = "LIFELINE_RESULT_TO_PARTICIPANT",

  CHAT_REACTION_EVENT = "CHAT_REACTION_EVENT",
  CHAT_MESSAGE = "CHAT_MESSAGE",

  INTERACTION_EVENT = "INTERACTION_EVENT",
  SETTINGS_CHANGE = "SETTINGS_CHANGE",

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

export interface ParticipantNameChangeEvent {
  choosenNickname: string;
}

export enum ReactorType {
  HOST = "HOST",
  SPECTATOR = "SPECTATOR",
}

export type ChatReactionType = {
  chatMessageId: string;
  reactorName: string;
  reactorAvatar: string;
  reaction: InteractionEnum;
  reactedAt: Date;
  reactorType: ReactorType;
};

export type ChatMessageType = {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: Date;
  senderAvatar?: string | null;
  repliedToId?: string;
  chatReactions: ChatReactionType[];
};

export interface SpectatorNameChangeEvent {
  choosenNickname: string;
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

export interface CollabCookiePayload {
  userId: string;
  quizId: string;
  collabSessionId: string;
  role: CollabRole;
  tokenId: string;
  iat: number;
  exp: number;
}

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
      requested_participant_id?: string;
    };

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
  reaction: InteractionEnum;
  reactedAt: Date;
  reactorType: ReactorType;
}

export const SECONDS = 1000;
