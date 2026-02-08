/*
  Warnings:

  - You are about to drop the `usage_records` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `name` on the `subscription_tiers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PRO');

-- DropForeignKey
ALTER TABLE "usage_records" DROP CONSTRAINT "usage_records_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "usage_records" DROP CONSTRAINT "usage_records_userId_fkey";

-- DropIndex
DROP INDEX "subscription_tiers_name_key";

-- AlterTable
ALTER TABLE "subscription_tiers" DROP COLUMN "name",
ADD COLUMN     "name" "SubscriptionType" NOT NULL;

-- DropTable
DROP TABLE "usage_records";
