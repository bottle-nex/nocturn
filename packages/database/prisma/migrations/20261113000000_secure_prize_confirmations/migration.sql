BEGIN;

ALTER TABLE "quizzes" ADD COLUMN "resultsCreatedAt" TIMESTAMP(3),
    ADD COLUMN "prizesFinalizedAt" TIMESTAMP(3);
ALTER TABLE "prize_claims" ADD COLUMN "finalizedAt" TIMESTAMP(3);

-- Stop rather than discard prizes if historical duplicate claims need reconciliation.
CREATE UNIQUE INDEX "prize_claims_quizId_participantId_key"
    ON "prize_claims"("quizId", "participantId");

CREATE TABLE "prize_transactions" (
    "signature" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prize_transactions_pkey" PRIMARY KEY ("signature")
);
CREATE UNIQUE INDEX "prize_transactions_step_referenceId_key"
    ON "prize_transactions"("step", "referenceId");

-- Previously accepted signatures must not become reusable after deployment.
INSERT INTO "prize_transactions" ("signature", "step", "referenceId")
    SELECT "onChainTxSignature", 'STAKE', "id" FROM "quizzes"
    WHERE "onChainTxSignature" IS NOT NULL;
INSERT INTO "prize_transactions" ("signature", "step", "referenceId")
    SELECT "txSignature", 'CLAIM', "id" FROM "prize_claims"
    WHERE "txSignature" IS NOT NULL;
UPDATE "quizzes" SET "resultsCreatedAt" = "updatedAt"
    WHERE "status" IN ('PAYOUT_PENDING', 'COMPLETED');

COMMIT;
