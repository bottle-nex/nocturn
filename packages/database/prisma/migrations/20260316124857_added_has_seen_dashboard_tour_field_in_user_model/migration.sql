/*
  Warnings:

  - Added the required column `hasSeenDashboardTour` to the `hosts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hosts" ADD COLUMN     "hasSeenDashboardTour" BOOLEAN NOT NULL;
