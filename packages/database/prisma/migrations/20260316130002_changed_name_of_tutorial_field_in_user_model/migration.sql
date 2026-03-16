/*
  Warnings:

  - You are about to drop the column `hasSeenDashboardTour` on the `hosts` table. All the data in the column will be lost.
  - Added the required column `isTutorialCompleted` to the `hosts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hosts" DROP COLUMN "hasSeenDashboardTour",
ADD COLUMN     "isTutorialCompleted" BOOLEAN NOT NULL;
