/*
  Warnings:

  - Added the required column `step` to the `AiQuizChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `element` to the `AiQuizMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AiMessageElement" AS ENUM ('DIFFICULTY');

-- AlterEnum
ALTER TYPE "AiQuizChatRole" ADD VALUE 'SYSTEM';

-- DropForeignKey
ALTER TABLE "AiQuizChatSession" DROP CONSTRAINT "AiQuizChatSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "AiQuizMessage" DROP CONSTRAINT "AiQuizMessage_aiQuizChatSessionId_fkey";

-- AlterTable
ALTER TABLE "AiQuizChatSession" ADD COLUMN     "step" "AgentStep" NOT NULL;

-- AlterTable
ALTER TABLE "AiQuizMessage" ADD COLUMN     "element" "AiMessageElement" NOT NULL;

-- AddForeignKey
ALTER TABLE "AiQuizChatSession" ADD CONSTRAINT "AiQuizChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizMessage" ADD CONSTRAINT "AiQuizMessage_aiQuizChatSessionId_fkey" FOREIGN KEY ("aiQuizChatSessionId") REFERENCES "AiQuizChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
