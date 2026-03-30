/*
  Warnings:

  - You are about to drop the column `amountLamports` on the `prize_claims` table. All the data in the column will be lost.
  - You are about to drop the column `amountLamports` on the `prize_distributions` table. All the data in the column will be lost.
  - Added the required column `amountBaseUnits` to the `prize_claims` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prize_claims" DROP COLUMN "amountLamports",
ADD COLUMN     "amountBaseUnits" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "prize_distributions" DROP COLUMN "amountLamports",
ADD COLUMN     "amountBaseUnits" BIGINT;

-- AlterTable
ALTER TABLE "quizzes" ALTER COLUMN "currency" SET DEFAULT 'USDC';
