/*
  Warnings:

  - Added the required column `updatedAt` to the `AiQuizChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AiQuizMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiQuizChatSession" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AiQuizMessage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "element" DROP NOT NULL;
