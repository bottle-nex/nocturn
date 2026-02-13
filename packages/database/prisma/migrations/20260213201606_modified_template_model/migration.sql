/*
  Warnings:

  - You are about to drop the column `theme` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `quizzes` table. All the data in the column will be lost.
  - Added the required column `accent_color` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accent_type` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `background_color` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `border_color` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `src` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text_color` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" DROP COLUMN "theme",
ADD COLUMN     "accent_color" TEXT NOT NULL,
ADD COLUMN     "accent_type" TEXT NOT NULL,
ADD COLUMN     "background_color" TEXT NOT NULL,
ADD COLUMN     "bars" TEXT[],
ADD COLUMN     "border_color" TEXT NOT NULL,
ADD COLUMN     "src" TEXT NOT NULL,
ADD COLUMN     "text_color" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "theme";
