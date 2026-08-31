/*
  Warnings:

  - You are about to drop the column `minimumProficiency` on the `OpportunitySkill` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CompetencyLevel" AS ENUM ('EXPOSURE', 'FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- AlterTable
ALTER TABLE "OpportunitySkill" DROP COLUMN "minimumProficiency",
ADD COLUMN     "requiredLevel" "CompetencyLevel" NOT NULL DEFAULT 'FOUNDATIONAL',
ALTER COLUMN "required" SET DEFAULT true,
ALTER COLUMN "weight" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "StudentSkill" ADD COLUMN     "competencyLevel" "CompetencyLevel",
ALTER COLUMN "proficiency" SET DEFAULT 0;
