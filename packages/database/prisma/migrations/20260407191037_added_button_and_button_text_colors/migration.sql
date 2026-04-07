/*
  Warnings:

  - Added the required column `button_color` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `button_text_color` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "button_color" TEXT NOT NULL,
ADD COLUMN     "button_text_color" TEXT NOT NULL,
ALTER COLUMN "items_text_color" DROP DEFAULT;
