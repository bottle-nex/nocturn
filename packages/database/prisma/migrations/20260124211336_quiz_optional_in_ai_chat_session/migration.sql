-- AlterEnum
ALTER TYPE "AgentStep" ADD VALUE 'PLANNING';

-- AlterTable
ALTER TABLE "AiQuizChatSession" ALTER COLUMN "quizId" DROP NOT NULL;
