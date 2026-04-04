/*
  Warnings:

  - Added the required column `items_color` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "items_color" TEXT NOT NULL;
