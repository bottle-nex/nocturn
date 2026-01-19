/*
  Warnings:

  - Made the column `deletedAt` on table `quizzes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "quizzes" ALTER COLUMN "deletedAt" SET NOT NULL;
