-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'CLAIMED', 'EXPIRED', 'REFUNDED');

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "escrowPda" TEXT,
ADD COLUMN     "onChainTxSignature" TEXT,
ADD COLUMN     "quizAccountPda" TEXT;

-- CreateTable
CREATE TABLE "prize_distributions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION,
    "amountLamports" BIGINT,

    CONSTRAINT "prize_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_claims" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountLamports" BIGINT NOT NULL,
    "claimToken" TEXT NOT NULL,
    "claimTokenHash" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP(3),
    "claimerWallet" TEXT,
    "txSignature" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prize_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prize_distributions_quizId_rank_key" ON "prize_distributions"("quizId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "prize_claims_claimToken_key" ON "prize_claims"("claimToken");

-- AddForeignKey
ALTER TABLE "prize_distributions" ADD CONSTRAINT "prize_distributions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_claims" ADD CONSTRAINT "prize_claims_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_claims" ADD CONSTRAINT "prize_claims_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
