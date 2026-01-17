-- CreateEnum
CREATE TYPE "CollaborationInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "CollaboratorInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "role" "CollabRole" NOT NULL DEFAULT 'VIEWER',
    "status" "CollaborationInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "CollaboratorInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorInvitation_sessionId_email_key" ON "CollaboratorInvitation"("sessionId", "email");

-- AddForeignKey
ALTER TABLE "CollaboratorInvitation" ADD CONSTRAINT "CollaboratorInvitation_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorInvitation" ADD CONSTRAINT "CollaboratorInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
