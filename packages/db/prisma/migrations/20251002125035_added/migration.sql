-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('WON', 'PENDING', 'LOST');

-- CreateTable
CREATE TABLE "cdo_bets" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "stakeAmount" INTEGER NOT NULL,
    "betStatus" "BetStatus" NOT NULL,
    "questionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,

    CONSTRAINT "cdo_bets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cdo_bets" ADD CONSTRAINT "cdo_bets_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cdo_bets" ADD CONSTRAINT "cdo_bets_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
