-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "LearningRoadmap" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapSkill" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "currentLevel" "CompetencyLevel" NOT NULL,
    "targetLevel" "CompetencyLevel" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoadmapSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapStep" (
    "id" TEXT NOT NULL,
    "roadmapSkillId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resourceUrl" TEXT,
    "estimatedHours" DOUBLE PRECISION,
    "order" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningRoadmap_studentProfileId_opportunityId_key" ON "LearningRoadmap"("studentProfileId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapSkill_roadmapId_skillId_key" ON "RoadmapSkill"("roadmapId", "skillId");

-- AddForeignKey
ALTER TABLE "LearningRoadmap" ADD CONSTRAINT "LearningRoadmap_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRoadmap" ADD CONSTRAINT "LearningRoadmap_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapSkill" ADD CONSTRAINT "RoadmapSkill_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "LearningRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapSkill" ADD CONSTRAINT "RoadmapSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapStep" ADD CONSTRAINT "RoadmapStep_roadmapSkillId_fkey" FOREIGN KEY ("roadmapSkillId") REFERENCES "RoadmapSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
