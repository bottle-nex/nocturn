export type QuestionFormat = "MULTIPLE_CHOICE" | "TRUE_FALSE";

export const TRUE_FALSE_OPTIONS = ["True", "False"] as const;

export function isValidAnswerIndex(
  answer: number,
  options: readonly string[],
): boolean {
  return Number.isInteger(answer) && answer >= 0 && answer < options.length;
}

export function hasValidQuestionOptions(question: {
  format?: QuestionFormat;
  options: readonly string[];
}): boolean {
  return (
    question.format !== "TRUE_FALSE" ||
    (question.options.length === TRUE_FALSE_OPTIONS.length &&
      question.options.every(
        (option, index) => option === TRUE_FALSE_OPTIONS[index],
      ))
  );
}
