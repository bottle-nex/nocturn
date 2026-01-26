-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "folderId" TEXT;

-- CreateTable
CREATE TABLE "quiz_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_folders_userId_idx" ON "quiz_folders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_folders_userId_name_key" ON "quiz_folders"("userId", "name");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "quiz_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_folders" ADD CONSTRAINT "quiz_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
