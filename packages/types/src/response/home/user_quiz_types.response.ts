import { QuizType, QuizViewsType } from "../../prisma/schemas.prisma";

// For /get-user-quiz endpoint
export type UserQuizResponse = QuizType[];

// For /get-shared-quiz endpoint
export type SharedQuizzesResponse = QuizType[];

// For /get-recently-viewed endpoint
export type RecentlyViewedResponse = QuizViewsType[];

// For /get-favourite-quizzes endpoint
export type FavouriteQuizzesResponse = QuizType[];
