import { QuestionType } from "../../prisma/schemas.prisma";

export interface getUnAskedQuestionResponse {
  end: boolean;
  question: Partial<QuestionType> | null;
}
