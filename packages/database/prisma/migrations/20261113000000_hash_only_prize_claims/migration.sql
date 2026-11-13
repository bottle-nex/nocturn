-- Existing exposed credentials cannot be secured retroactively. Pending claims
-- must be reissued with new credentials and new on-chain claim accounts.
DROP INDEX "prize_claims_claimToken_key";
ALTER TABLE "prize_claims" DROP COLUMN "claimToken";
CREATE UNIQUE INDEX "prize_claims_claimTokenHash_key" ON "prize_claims"("claimTokenHash");
