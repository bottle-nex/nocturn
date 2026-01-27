/*
  Warnings:

  - You are about to drop the `quiz_folders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "quiz_folders" DROP CONSTRAINT "quiz_folders_userId_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_folderId_fkey";

-- DropTable
DROP TABLE "quiz_folders";
