CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "usage_records_count_check" CHECK ("count" >= 0)
);
CREATE UNIQUE INDEX "usage_records_userId_feature_periodStart_key"
    ON "usage_records"("userId", "feature", "periodStart");
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
