ALTER TABLE "quizzes" ADD COLUMN "payoutSealedAt" TIMESTAMP(3), ADD COLUMN "payoutError" TEXT;
ALTER TABLE "prize_claims" ALTER COLUMN "expiresAt" DROP NOT NULL;
ALTER TABLE "prize_claims" ADD COLUMN "emailQueuedAt" TIMESTAMP(3), ADD COLUMN "emailAttemptedAt" TIMESTAMP(3);
