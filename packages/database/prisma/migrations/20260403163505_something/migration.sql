-- AlterEnum
ALTER TYPE "TemplateEnum" ADD VALUE 'CUSTOM';

-- DropIndex
DROP INDEX "Template_name_key";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
