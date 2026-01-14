-- CreateEnum
CREATE TYPE "CollabRole" AS ENUM ('HOST', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollabRole" NOT NULL DEFAULT 'VIEWER',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collab_sessions" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collab_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_sessionId_userId_key" ON "Collaborator"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "collab_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collab_sessions" ADD CONSTRAINT "collab_sessions_id_fkey" FOREIGN KEY ("id") REFERENCES "hosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
