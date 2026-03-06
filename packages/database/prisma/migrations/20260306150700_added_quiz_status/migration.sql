/*
  Warnings:

  - The values [ENDED] on the enum `SessionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "QuizStatus" ADD VALUE 'TIMED_OUT';

-- AlterEnum
BEGIN;
CREATE TYPE "SessionStatus_new" AS ENUM ('WAITING', 'LIVE', 'COMPLETED', 'PAUSED', 'TIMED_OUT');
ALTER TABLE "public"."game_sessions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "game_sessions" ALTER COLUMN "status" TYPE "SessionStatus_new" USING ("status"::text::"SessionStatus_new");
ALTER TYPE "SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "public"."SessionStatus_old";
ALTER TABLE "game_sessions" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;
