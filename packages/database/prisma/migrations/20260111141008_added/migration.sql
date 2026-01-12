-- CreateTable
CREATE TABLE "quiz_views" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_views_userId_viewedAt_idx" ON "quiz_views"("userId", "viewedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_views_quizId_userId_key" ON "quiz_views"("quizId", "userId");

-- AddForeignKey
ALTER TABLE "quiz_views" ADD CONSTRAINT "quiz_views_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_views" ADD CONSTRAINT "quiz_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
