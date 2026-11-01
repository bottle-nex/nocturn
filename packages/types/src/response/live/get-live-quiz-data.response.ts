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

export interface getLiveQuizDataResponse {
  quiz: Partial<QuizType> & {
    _count?: { questions: number; participants: number };
  };
  gameSession: Partial<GameSessionType>;
  userData: UserType | ParticipantType | SpectatorType;
  participants: ParticipantType[];
  spectators: SpectatorType[];
  currentQuestion: Partial<QuestionType> | null;
  role: USER_TYPE;
  messages?: ChatMessageType[];
  response?: Partial<ResponseType> | null;
  leaderboard: {
    topScores: {
      id: string;
      nickname: string;
      avatar: string | null;
      totalScore: number;
      rank: number;
    }[];
    totalParticipants: number;
    myRank: number | null;
    myScore: number | null;
  } | null;
  askedQuestionCount: number | null;
}
