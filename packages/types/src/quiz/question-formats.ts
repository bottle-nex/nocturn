import { z } from "zod";

export const QUESTION_FORMATS = ["MULTIPLE_CHOICE", "TRUE_FALSE"] as const;
export type QuestionFormat = (typeof QUESTION_FORMATS)[number];

export const TRUE_FALSE_OPTIONS = ["True", "False"] as const;

export function getQuestionFormatDefaults(format: QuestionFormat) {
  return {
    format,
    options:
      format === "TRUE_FALSE"
        ? [...TRUE_FALSE_OPTIONS]
        : ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: 0,
  };
}

// The default keeps saved drafts and API clients created before formats compatible.
export const questionAnswerSchema = z
  .object({
    format: z.enum(QUESTION_FORMATS).default("MULTIPLE_CHOICE"),
    options: z.array(z.string()).min(2).max(6),
    correctAnswer: z.number().int().nonnegative(),
  })
  .superRefine((question, ctx) => {
    if (question.correctAnswer >= question.options.length) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Choose a correct answer from the available options",
      });
    }
    if (
      question.format === "TRUE_FALSE" &&
      (question.options.length !== 2 ||
        question.options.some(
          (option, index) => option !== TRUE_FALSE_OPTIONS[index],
        ))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message:
          'True or false questions must have exactly ["True", "False"] as options',
      });
    }
  });
