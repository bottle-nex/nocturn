-- CreateEnum
CREATE TYPE "AgentStep" AS ENUM ('START', 'ASK_DIFFICULTY', 'WAIT_DIFFICULTY', 'GENERATE', 'REVISE', 'DONE');

-- CreateEnum
CREATE TYPE "AiQuizChatRole" AS ENUM ('AGENT', 'USER');

-- CreateTable
CREATE TABLE "AiQuizChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instruction" TEXT,
    "difficulty" INTEGER,
    "quizId" TEXT NOT NULL,
    "revisionFeedback" TEXT,

    CONSTRAINT "AiQuizChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizMessage" (
    "id" TEXT NOT NULL,
    "aiQuizChatSessionId" TEXT NOT NULL,
    "role" "AiQuizChatRole" NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "AiQuizMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiQuizChatSession_quizId_key" ON "AiQuizChatSession"("quizId");

-- AddForeignKey
ALTER TABLE "AiQuizChatSession" ADD CONSTRAINT "AiQuizChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizChatSession" ADD CONSTRAINT "AiQuizChatSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizMessage" ADD CONSTRAINT "AiQuizMessage_aiQuizChatSessionId_fkey" FOREIGN KEY ("aiQuizChatSessionId") REFERENCES "AiQuizChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
