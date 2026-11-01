import { z } from "zod";

export const QUESTION_TYPES = [
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "MULTI_SELECT",
  "SHORT_ANSWER",
  "ORDERING",
  "NUMERIC",
] as const;
export type QuestionKind = (typeof QUESTION_TYPES)[number];
export type SubmittedAnswer = number | string | number[];
export const answerConfigSchema = z.object({
  correctIndices: z.array(z.number().int().nonnegative()).optional(),
  acceptedAnswers: z.array(z.string().max(200)).max(20).optional(),
  correctOrder: z.array(z.number().int().nonnegative()).optional(),
  min: z.number().finite().optional(),
  max: z.number().finite().optional(),
  target: z.number().finite().optional(),
  tolerance: z.number().finite().positive().optional(),
});
export type AnswerConfig = z.infer<typeof answerConfigSchema>;
export interface QuestionDefinition {
  questionType?: string;
  options: string[];
  correctAnswer: number;
  answerConfig?: unknown;
}
export const normalizeAnswer = (value: string) =>
  value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US");
export function getAnswerConfig(
  question: Pick<QuestionDefinition, "answerConfig">,
): AnswerConfig {
  return answerConfigSchema.parse(question.answerConfig ?? {});
}

export function questionProblem(q: QuestionDefinition): string | null {
  const type = q.questionType ?? "MULTIPLE_CHOICE";
  const c = getAnswerConfig(q);
  const indices = (xs: number[] | undefined) =>
    !!xs?.length &&
    new Set(xs).size === xs.length &&
    xs.every((i) => Number.isInteger(i) && i >= 0 && i < q.options.length);
  if (!QUESTION_TYPES.includes(type as QuestionKind))
    return "Unknown question type";
  if (type === "SHORT_ANSWER")
    return c.acceptedAnswers?.length &&
      c.acceptedAnswers.every((a) => normalizeAnswer(a).length > 0)
      ? null
      : "Enter at least one accepted answer";
  if (type === "NUMERIC")
    return c.min !== undefined &&
      c.max !== undefined &&
      c.target !== undefined &&
      c.tolerance !== undefined &&
      c.min < c.max &&
      c.target >= c.min &&
      c.target <= c.max
      ? null
      : "Set a valid numeric range, target, and positive scoring distance";
  if (q.options.length < 2 || q.options.length > 6)
    return "Use between two and six options";
  if (
    type === "TRUE_FALSE" &&
    (q.options.length !== 2 ||
      q.options[0] !== "True" ||
      q.options[1] !== "False")
  )
    return "True or false uses fixed True and False options";
  if (type === "MULTI_SELECT")
    return indices(c.correctIndices) ? null : "Select the correct options";
  if (type === "ORDERING")
    return indices(c.correctOrder) &&
      c.correctOrder?.length === q.options.length
      ? null
      : "Set a complete correct order";
  return Number.isInteger(q.correctAnswer) &&
    q.correctAnswer >= 0 &&
    q.correctAnswer < q.options.length
    ? null
    : "Select a valid correct option";
}

// null means malformed input; zero is a valid answer worth no credit.
export function answerCredit(
  q: QuestionDefinition,
  answer: unknown,
): number | null {
  const type = q.questionType ?? "MULTIPLE_CHOICE";
  const c = getAnswerConfig(q);
  if (type === "SHORT_ANSWER")
    return typeof answer === "string" &&
      answer.length > 0 &&
      answer.length <= 200
      ? Number(
          c.acceptedAnswers?.some(
            (a) => normalizeAnswer(a) === normalizeAnswer(answer),
          ),
        )
      : null;
  if (type === "NUMERIC") {
    if (
      typeof answer !== "number" ||
      !Number.isFinite(answer) ||
      answer < c.min! ||
      answer > c.max!
    )
      return null;
    return Math.max(0, 1 - Math.abs(answer - c.target!) / c.tolerance!);
  }
  if (type === "MULTI_SELECT" || type === "ORDERING") {
    if (
      !Array.isArray(answer) ||
      !answer.length ||
      answer.length > q.options.length ||
      new Set(answer).size !== answer.length ||
      answer.some((i) => !Number.isInteger(i) || i < 0 || i >= q.options.length)
    )
      return null;
    if (type === "MULTI_SELECT")
      return Number(
        answer.length === c.correctIndices?.length &&
          answer.every((i) => c.correctIndices!.includes(i)),
      );
    if (answer.length !== q.options.length) return null;
    return (
      answer.filter((value, i) => value === c.correctOrder?.[i]).length /
      q.options.length
    );
  }
  return typeof answer === "number" &&
    Number.isInteger(answer) &&
    answer >= 0 &&
    answer < q.options.length
    ? Number(answer === q.correctAnswer)
    : null;
}

// Only the range is public. Targets, accepted strings, and order keys stay server-side.
export function publicQuestion<T extends QuestionDefinition>(q: T) {
  const {
    correctAnswer: _correctAnswer,
    answerConfig: _answerConfig,
    explanation: _explanation,
    ...rest
  } = q as T & { explanation?: unknown };
  const c = getAnswerConfig(q);
  return {
    ...rest,
    questionType: (q.questionType ?? "MULTIPLE_CHOICE") as QuestionKind,
    answerConfig:
      q.questionType === "NUMERIC" ? { min: c.min, max: c.max } : {},
  };
}

export function formatAnswer(q: QuestionDefinition, answer: unknown): string {
  if (q.questionType === "SHORT_ANSWER" || q.questionType === "NUMERIC")
    return String(answer ?? "No answer");
  if (Array.isArray(answer))
    return answer
      .map((i) => q.options[i])
      .join(q.questionType === "ORDERING" ? " → " : ", ");
  return typeof answer === "number"
    ? (q.options[answer] ?? "No answer")
    : "No answer";
}
export function correctAnswerLabel(q: QuestionDefinition): string {
  const c = getAnswerConfig(q);
  if (q.questionType === "SHORT_ANSWER")
    return c.acceptedAnswers?.join(" / ") ?? "";
  if (q.questionType === "NUMERIC") return String(c.target ?? "");
  return formatAnswer(
    q,
    q.questionType === "ORDERING"
      ? c.correctOrder
      : q.questionType === "MULTI_SELECT"
        ? c.correctIndices
        : q.correctAnswer,
  );
}

// Store ordering options alphabetically so their storage order cannot reveal the key.
export function canonicalQuestion<T extends QuestionDefinition>(q: T): T {
  if (q.questionType !== "ORDERING") return q;
  const indices = q.options
    .map((_, i) => i)
    .sort((a, b) => q.options[a]!.localeCompare(q.options[b]!));
  const c = getAnswerConfig(q);
  return {
    ...q,
    options: indices.map((i) => q.options[i]!),
    answerConfig: {
      ...c,
      correctOrder: c.correctOrder?.map((i) => indices.indexOf(i)),
    },
  };
}
