import { prisma } from "./client";
import { Prisma, QuizPhase } from "../generated/client";

// Phase changes take an exclusive session lock across server processes.
// Answers share that lock and serialize only writes for the same participant.
// A results snapshot cannot overtake an answer that is being committed.
export async function withGameSessionLock<T>(
  gameSessionId: string,
  action: (tx: Prisma.TransactionClient) => Promise<T>,
  lock: "shared" | "exclusive" = "exclusive",
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    if (lock === "shared") {
      await tx.$queryRaw`SELECT id FROM game_sessions WHERE id = ${gameSessionId} FOR SHARE`;
    } else {
      await tx.$queryRaw`SELECT id FROM game_sessions WHERE id = ${gameSessionId} FOR UPDATE`;
    }
    return action(tx);
  });
}

export async function acceptAnswer(
  gameSessionId: string,
  participantId: string,
  selectedAnswer: number,
  answeredAt: number,
) {
  return withGameSessionLock(
    gameSessionId,
    async (tx) => {
      const session = await tx.gameSession.findUnique({
        where: { id: gameSessionId },
      });
      if (
        !session ||
        session.currentPhase !== QuizPhase.QUESTION_ACTIVE ||
        !session.currentQuestionId ||
        !session.phaseStartTime ||
        !session.phaseEndTime ||
        answeredAt < session.phaseStartTime.getTime() ||
        answeredAt >= session.phaseEndTime.getTime()
      )
        return null;

      const question = await tx.question.findUnique({
        where: { id: session.currentQuestionId },
      });
      await tx.$queryRaw`SELECT id FROM participants WHERE id = ${participantId} FOR UPDATE`;
      const participant = await tx.participant.findUnique({
        where: { id: participantId },
      });
      if (
        !question ||
        !participant ||
        participant.quizId !== session.quizId ||
        participant.isKicked ||
        !Number.isInteger(selectedAnswer) ||
        selectedAnswer < 0 ||
        selectedAnswer >= question.options.length
      )
        return null;

      const existing = await tx.response.findUnique({
        where: {
          participantId_questionId: { participantId, questionId: question.id },
        },
      });
      if (existing) return null;

      const quiz = await tx.quiz.findUniqueOrThrow({
        where: { id: session.quizId },
      });
      const timeToAnswer = answeredAt - session.phaseStartTime.getTime();
      const isCorrect = selectedAnswer === question.correctAnswer;
      const currentStreak = isCorrect ? participant.currentStreak + 1 : 0;
      const duration = question.timeLimit * 1000;
      const remainingFraction =
        duration > 0
          ? Math.max(0, Math.min(1, (duration - timeToAnswer) / duration))
          : 0;
      const timeBonus =
        isCorrect && quiz.timeBonus
          ? Math.min(
              Math.floor(question.basePoints * 0.5),
              Math.round(question.basePoints * remainingFraction * 0.5),
            )
          : 0;
      const streakBonus = isCorrect ? Math.min(currentStreak * 10, 50) : 0;
      const pointsEarned = isCorrect
        ? question.basePoints + timeBonus + streakBonus
        : 0;
      const response = await tx.response.create({
        data: {
          participantId,
          gameSessionId,
          questionId: question.id,
          selectedAnswer,
          isCorrect,
          timeToAnswer,
          pointsEarned,
          timeBonus,
          streakBonus,
          answeredAt: new Date(answeredAt),
        },
      });
      const updatedParticipant = await tx.participant.update({
        where: { id: participantId },
        data: {
          totalScore: { increment: pointsEarned },
          correctAnswers: { increment: isCorrect ? 1 : 0 },
          currentStreak,
          longestStreak: Math.max(participant.longestStreak, currentStreak),
        },
      });
      return { response, participant: updatedParticipant };
    },
    "shared",
  );
}
