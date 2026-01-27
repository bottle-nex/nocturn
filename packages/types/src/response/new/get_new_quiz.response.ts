// type: QuizResponseType.QUIZ_FOUND,
//                 quiz: quiz,

import { QuizType } from "../../prisma/schemas.prisma";

export enum QuizResponseType {
  QUIZ_FOUND = "QUIZ_FOUND",
  QUIZ_NOT_EXIST = "QUIZ_NOT_EXIST",
  ACCESS_DENIED = "ACCESS_DENIED",
  INVALID_QUIZ_ID = "INVALID_QUIZ_ID",
  INVALID_USER = "INVALID_USER",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}


export interface GetNewQuizResponse {
    type: QuizResponseType;
    quiz: Partial<QuizType> | null;
}