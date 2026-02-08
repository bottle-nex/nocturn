-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'ABANDONED', 'FAILED');

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" TEXT NOT NULL,
    "dodoSessionId" TEXT NOT NULL,
    "checkoutUrl" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'PENDING',
    "subscriptionId" TEXT,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_dodoSessionId_key" ON "checkout_sessions"("dodoSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_subscriptionId_key" ON "checkout_sessions"("subscriptionId");

-- CreateIndex
CREATE INDEX "checkout_sessions_userId_status_idx" ON "checkout_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "checkout_sessions_dodoSessionId_idx" ON "checkout_sessions"("dodoSessionId");

-- CreateIndex
CREATE INDEX "checkout_sessions_status_createdAt_idx" ON "checkout_sessions"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "subscription_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
