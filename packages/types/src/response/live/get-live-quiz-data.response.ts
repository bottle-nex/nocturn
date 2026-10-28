import { USER_TYPE } from "../../prisma/enums.prisma";
import {
  GameSessionType,
  ParticipantType,
  QuestionType,
  QuizType,
  ResponseType,
  SpectatorType,
  UserType,
} from "../../prisma/schemas.prisma";
import { ChatMessageType } from "../../socket/socket.types";

export interface LiveLeaderboardEntry {
  id: string;
  totalScore: number;
  rank: number;
  nickname: string;
  avatar: string | null;
}

export interface LiveLeaderboardSnapshot {
  topScores: LiveLeaderboardEntry[];
  totalParticipants: number;
  myRank: number | null;
  myScore: number | null;
}

export interface getLiveQuizDataResponse {
  quiz: Partial<QuizType>;
  gameSession: Partial<GameSessionType>;
  userData: UserType | ParticipantType | SpectatorType;
  participants: ParticipantType[];
  spectators: SpectatorType[];
  currentQuestion: Partial<QuestionType> | null;
  role: USER_TYPE;
  messages?: ChatMessageType[];
  response?: Partial<ResponseType>;
  askedQuestionCount: number | null;
  leaderboard?: LiveLeaderboardSnapshot;
  responses?: Partial<ResponseType>[];
}
