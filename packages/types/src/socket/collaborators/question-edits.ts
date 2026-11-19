import { QuestionType } from "../../prisma/schemas.prisma";

export interface QuestionEdit {
  mutationId: string;
  base: QuestionType;
  changes: Partial<QuestionType>;
}

export interface QuestionEditResult {
  mutationId: string;
  question: QuestionType;
  conflicts: string[];
  error?: string;
}

const equal = (left: unknown, right: unknown) =>
  JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

// Options retain their position while typing. Reordering/removing options and changing
// the correct answer must be checked together, because that answer is an array index.
export function mergeQuestionEdit(
  current: QuestionType,
  edit: QuestionEdit,
  checkConflicts = true,
) {
  const { base, changes } = edit;
  const question = { ...current };
  const conflicts: string[] = [];
  const structuralOptions =
    changes.options &&
    (changes.options.length !== base.options.length ||
      changes.correctAnswer !== undefined);

  for (const field of Object.keys(changes) as (keyof QuestionType)[]) {
    if (
      [
        "id",
        "quizId",
        "quiz",
        "orderIndex",
        "isAsked",
        "hintLaunched",
      ].includes(field)
    )
      continue;
    const value = changes[field];
    if (value === undefined || equal(value, base[field])) continue;

    if (field === "options" && changes.options && !structuralOptions) {
      if (current.options.length !== base.options.length) {
        if (!checkConflicts) {
          question.options = [...changes.options];
          question.correctAnswer = base.correctAnswer;
          continue;
        }
        conflicts.push("options");
        continue;
      }
      const options = [...current.options];
      changes.options.forEach((option, index) => {
        if (option === base.options[index]) return;
        if (
          checkConflicts &&
          current.options[index] !== base.options[index] &&
          current.options[index] !== option
        ) {
          conflicts.push(`options[${index + 1}]`);
        }
        options[index] = option;
      });
      question.options = options;
    } else {
      if (
        checkConflicts &&
        !equal(current[field], base[field]) &&
        !equal(current[field], value)
      ) {
        conflicts.push(field);
      }
      Object.assign(question, { [field]: value });
    }
  }

  if (
    checkConflicts &&
    (structuralOptions || changes.correctAnswer !== undefined)
  ) {
    if (
      !equal(current.options, base.options) &&
      !equal(current.options, changes.options)
    )
      conflicts.push("options");
    if (
      current.correctAnswer !== base.correctAnswer &&
      current.correctAnswer !== changes.correctAnswer
    )
      conflicts.push("correctAnswer");
  }

  return {
    question: conflicts.length && checkConflicts ? current : question,
    conflicts: [...new Set(conflicts)],
  };
}

// Keep newer optimistic keystrokes visible when an earlier acknowledgement arrives.
export class QuestionEditBuffer {
  private pending = new Map<string, QuestionEdit>();

  hasPending(quizId: string) {
    return [...this.pending.values()].some(
      (edit) => edit.base.quizId === quizId,
    );
  }

  add(edit: QuestionEdit) {
    this.pending.set(edit.mutationId, edit);
  }

  send(
    edit: QuestionEdit,
    sessionId: string | undefined,
    send: (payload: QuestionEdit) => boolean,
  ) {
    if (!sessionId) return;
    this.add(edit);
    if (!send(edit)) this.pending.delete(edit.mutationId);
  }

  receive(result: QuestionEditResult) {
    const ownEdit = this.pending.get(result.mutationId);
    this.pending.delete(result.mutationId);
    let question = result.question;
    for (const edit of this.pending.values()) {
      if (edit.base.id === question.id)
        question = mergeQuestionEdit(question, edit, false).question;
    }
    return { question, ownEdit };
  }
}
