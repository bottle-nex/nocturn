/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `subscription_tiers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscription_tiers_name_key" ON "subscription_tiers"("name");
