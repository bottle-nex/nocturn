/*
  Warnings:

  - The `currency` column on the `quizzes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USDC', 'NONE');

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'NONE';
