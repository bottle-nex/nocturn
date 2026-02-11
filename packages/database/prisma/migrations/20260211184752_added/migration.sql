/*
  Warnings:

  - The `learningJourneyStep` column on the `hosts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "hosts" DROP COLUMN "learningJourneyStep",
ADD COLUMN     "learningJourneyStep" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
