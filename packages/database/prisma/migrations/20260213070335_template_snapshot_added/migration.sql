-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "theme" JSONB,
ALTER COLUMN "templateId" SET DEFAULT 'CLASSIC';
