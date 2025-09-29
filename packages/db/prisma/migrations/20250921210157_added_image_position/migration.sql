-- CreateEnum
CREATE TYPE "ImagePosition" AS ENUM ('RIGHT', 'LEFT');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "imagePosition" "ImagePosition" NOT NULL DEFAULT 'RIGHT';
