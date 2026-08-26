-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EvidenceType" ADD VALUE 'NPTEL';
ALTER TYPE "EvidenceType" ADD VALUE 'ACADEMIC_CREDENTIAL';

-- CreateTable
CREATE TABLE "AcademicCredential" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "credentialId" TEXT,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "score" DOUBLE PRECISION,
    "credits" DOUBLE PRECISION,
    "issueDate" TIMESTAMP(3),
    "verificationUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStrength" "VerificationStrength" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCredential_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AcademicCredential" ADD CONSTRAINT "AcademicCredential_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
