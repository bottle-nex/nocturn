import { QuizType, QuizViewsType } from "../../prisma/schemas.prisma";

export interface UserQuizResponse {
  recentlyViewed: QuizViewsType[];
  quizzes: QuizType[];
}
