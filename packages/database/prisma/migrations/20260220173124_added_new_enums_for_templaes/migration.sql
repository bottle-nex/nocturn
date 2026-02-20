/*
  Warnings:

  - The `name` column on the `Template` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TemplateEnum" AS ENUM ('CLASSIC', 'MODERN', 'PASTEL', 'NEON', 'YELLOW', 'GREEN', 'BLUE');

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "name",
ADD COLUMN     "name" "TemplateEnum" NOT NULL DEFAULT 'CLASSIC';

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");
