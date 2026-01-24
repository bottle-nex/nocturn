import {
  GameSessionType,
  ParticipantType,
  QuestionType,
  QuizType,
  SpectatorType,
  USER_TYPE,
  UserType,
} from "../../prisma/schemas.prisma";

import { ChatMessageType } from "../../socket/socket.types";

export interface LiveQuizDataResponse {
  quiz: Partial<QuizType>;
  gameSession: Partial<GameSessionType>;
  userData: UserType | ParticipantType | SpectatorType;
  participants: ParticipantType[];
  spectators: SpectatorType[];
  role: USER_TYPE;
  question?: Partial<QuestionType>;
  isNextQuestionAvailable?: boolean;
  messages?: ChatMessageType[];
}
