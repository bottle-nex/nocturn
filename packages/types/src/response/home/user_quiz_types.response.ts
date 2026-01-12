import { QuizType, QuizViewsType } from "../../prisma/prisma-types";

export interface UserQuizResponse {
    recentlyViewed: QuizViewsType[],
    quizzes: Partial<QuizType>[];
}