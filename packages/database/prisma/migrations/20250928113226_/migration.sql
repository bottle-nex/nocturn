-- CreateTable
CREATE TABLE "lifeline_usage" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifeline_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lifeline_usage_participantId_gameSessionId_key" ON "lifeline_usage"("participantId", "gameSessionId");

-- AddForeignKey
ALTER TABLE "lifeline_usage" ADD CONSTRAINT "lifeline_usage_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifeline_usage" ADD CONSTRAINT "lifeline_usage_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
