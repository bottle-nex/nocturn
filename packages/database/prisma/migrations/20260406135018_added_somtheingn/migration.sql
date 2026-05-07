-- AlterTable
ALTER TABLE "Template" ALTER COLUMN "items_color" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN "items_text_color" TEXT NOT NULL DEFAULT '';
