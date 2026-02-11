import { UserQuizResponse } from "./home/user_quiz_types.response";
import { GetNewQuizResponse } from "./new/get_new_quiz.response";
import { GetReviewsResponse } from "./home/get_reviews_type.response";
import { LiveQuizDataResponse } from "./live/live-quiz-types";
import { getUnAskedQuestionResponse } from "./live/get-un-asked-question.response";
import { getLiveQuizDataResponse } from "./live/get-live-quiz-data.response";

export enum ApiResponse {
  LIVE_QUIZ = "LIVE_QUIZ",
  GET_NEW_QUIZ = "GET_NEW_QUIZ",
  USER_QUIZ = "USER_QUIZ",
  GET_REVIEW_DTO = "GET_REVIEW_DTO",
  GET_UN_ASKED_QUESTION = "GET_UN_ASKED_QUESTION",
  GET_LIVE_QUIZ_DATA = "GET_LIVE_QUIZ_DATA",
}

export type ApiResponseData = {
  LIVE_QUIZ: LiveQuizDataResponse;
  GET_NEW_QUIZ: GetNewQuizResponse;
  USER_QUIZ: UserQuizResponse;
  GET_REVIEW_DTO: GetReviewsResponse;
  GET_UN_ASKED_QUESTION: getUnAskedQuestionResponse;
  GET_LIVE_QUIZ_DATA: getLiveQuizDataResponse;
};

export type ApiResponsePayload = {
  [T in keyof ApiResponseData]: {
    type: T;
    data: ApiResponseData[T];
  };
}[keyof ApiResponseData];
