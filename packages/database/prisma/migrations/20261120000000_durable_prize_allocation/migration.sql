-- Existing duplicated prizes need on-chain reconciliation before this constraint
-- can be installed. Never delete financial evidence to make a migration pass.
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM "prize_claims" GROUP BY "quizId", "participantId" HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate prize claims require on-chain reconciliation before migration';
    END IF;
END $$;
ALTER TABLE "quizzes" ADD COLUMN "fundedBaseUnits" TEXT;
ALTER TABLE "quizzes" ADD COLUMN "payoutPreparedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "prize_claims_quizId_participantId_key" ON "prize_claims"("quizId", "participantId");
