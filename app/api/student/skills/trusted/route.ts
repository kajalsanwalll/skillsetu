import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateTrustedProficiency } from "@/lib/skills/calculate-trusted-proficiency";

export async function GET() {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            evidence: true,
          },
        },
      },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Student access required.",
        },
        { status: 403 }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    const skills =
      user.studentProfile.skills.map(
        (studentSkill) => {
          const skillEvidence =
            user.studentProfile!.evidence.filter(
              (evidence) =>
                evidence.skillId ===
                studentSkill.skillId
            );

          const result =
            calculateTrustedProficiency({
              claimedProficiency:
                studentSkill.proficiency,

              evidence: skillEvidence.map(
                (evidence) => ({
                  score: evidence.score,
                  verified: evidence.verified,
                  verificationStrength:
                    evidence.verificationStrength,
                })
              ),
            });

          return {
            id: studentSkill.id,

            skill: {
              id: studentSkill.skill.id,
              name: studentSkill.skill.name,
              category:
                studentSkill.skill.category,
            },

            claimedProficiency:
              result.claimedProficiency,

            evidenceScore:
              result.evidenceScore,

            trustedProficiency:
              result.trustedProficiency,

            confidence:
              result.confidence,

            evidenceCount:
              skillEvidence.length,

            verifiedEvidenceCount:
              skillEvidence.filter(
                (evidence) =>
                  evidence.verified
              ).length,
          };
        }
      );

    return NextResponse.json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error(
      "TRUSTED_SKILLS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to calculate trusted skills.",
      },
      { status: 500 }
    );
  }
}