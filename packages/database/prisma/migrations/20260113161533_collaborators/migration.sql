/*
  Warnings:

  - A unique constraint covering the columns `[quizId]` on the table `collab_sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quizId` to the `collab_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "collab_sessions" DROP CONSTRAINT "collab_sessions_id_fkey";

-- AlterTable
ALTER TABLE "collab_sessions" ADD COLUMN     "quizId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "collab_sessions_quizId_key" ON "collab_sessions"("quizId");

-- AddForeignKey
ALTER TABLE "collab_sessions" ADD CONSTRAINT "collab_sessions_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collab_sessions" ADD CONSTRAINT "collab_sessions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
