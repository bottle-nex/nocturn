/*
  Warnings:

  - The values [RESULT_READY] on the enum `QuizEndScreen` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuizEndScreen_new" AS ENUM ('ARE_YOU_UP', 'READY_TO_ANNOUNCE', 'ANNOUNCED');
ALTER TABLE "game_sessions" ALTER COLUMN "quizEndScreen" TYPE "QuizEndScreen_new" USING ("quizEndScreen"::text::"QuizEndScreen_new");
ALTER TYPE "QuizEndScreen" RENAME TO "QuizEndScreen_old";
ALTER TYPE "QuizEndScreen_new" RENAME TO "QuizEndScreen";
DROP TYPE "public"."QuizEndScreen_old";
COMMIT;
