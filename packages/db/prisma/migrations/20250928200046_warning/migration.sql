-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "isKicked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "spectators" ADD COLUMN     "isKicked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "warningCount" INTEGER NOT NULL DEFAULT 0;
