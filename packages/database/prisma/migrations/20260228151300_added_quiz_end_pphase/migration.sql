-- CreateEnum
CREATE TYPE "QuizEndScreen" AS ENUM ('RESULT_READY', 'READY_TO_ANNOUNCE', 'ANNOUNCED');

-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN     "quizEndScreen" "QuizEndScreen";
