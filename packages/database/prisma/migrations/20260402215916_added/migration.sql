/*
  Warnings:

  - The `pointsMultiplier` column on the `quizzes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PointsMultiplier" AS ENUM ('LINEAR', 'STEPPED', 'MANUAL', 'NONE');

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "batchSize" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "pointsIncrement" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "pointsMultiplier",
ADD COLUMN     "pointsMultiplier" "PointsMultiplier" NOT NULL DEFAULT 'NONE';
