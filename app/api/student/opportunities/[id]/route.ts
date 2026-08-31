import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateGapAnalysis } from "@/lib/matching/calculate-gap";
import { calculateTrustedProficiency } from "@/lib/skills/calculate-trusted-proficiency";

/**
 * Internal numeric values used by the existing
 * gap-analysis / matching calculations.
 *
 * The UI should display competency levels instead
 * of these percentages.
 */
const COMPETENCY_PROFICIENCY: Record<string, number> = {
  EXPOSURE: 20,
  FOUNDATIONAL: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 100,
};

/**
 * Convert trusted numeric proficiency into the
 * competency level shown to the student.
 */
function proficiencyToCompetencyLevel(
  proficiency: number
) {
  if (proficiency >= 90) return "EXPERT";
  if (proficiency >= 75) return "ADVANCED";
  if (proficiency >= 50) return "INTERMEDIATE";
  if (proficiency >= 25) return "FOUNDATIONAL";

  return "EXPOSURE";
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // 1. Authenticate

    const { isAuthenticated, userId } =
      await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // 2. Find SkillSetu user

    const user =
      await prisma.user.findUnique({
        where: {
          clerkId: userId,
        },

        include: {
          studentProfile: {
            include: {
              skills: true,

              /**
               * Needed to calculate trusted proficiency,
               * exactly like the opportunities listing route.
               */
              evidence: true,
            },
          },
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    // 3. Student-only access

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can view student opportunities.",
        },
        {
          status: 403,
        }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    // 4. Get opportunity ID

    const { id } = await params;

    // 5. Fetch opportunity

    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id,
        },

        include: {
          industry: {
            select: {
              name: true,
            },
          },

          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

    // 6. Opportunity not found

    if (!opportunity) {
      return NextResponse.json(
        {
          error: "Opportunity not found.",
        },
        {
          status: 404,
        }
      );
    }

    // 7. Calculate TRUSTED proficiency for every student skill

    const trustedSkills =
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

              evidence:
                skillEvidence.map(
                  (evidence) => ({
                    score: evidence.score,
                    verified: evidence.verified,
                    verificationStrength:
                      evidence.verificationStrength,
                  })
                ),
            });

          return {
            skillId: studentSkill.skillId,

            claimedProficiency:
              result.claimedProficiency,

            trustedProficiency:
              result.trustedProficiency,

            evidenceScore:
              result.evidenceScore,

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

    // 8. Prepare student skills for the existing gap engine

    const studentSkillsForGap =
      trustedSkills.map(
        (studentSkill) => ({
          skillId: studentSkill.skillId,

          /**
           * Keep calculateGapAnalysis compatible.
           *
           * IMPORTANT:
           * This is TRUSTED proficiency, not
           * self-reported proficiency.
           */
          proficiency:
            studentSkill.trustedProficiency,
        })
      );

    // 9. Prepare opportunity requirements

    const opportunitySkillsForGap =
      opportunity.skills.map(
        (opportunitySkill) => ({
          skillId:
            opportunitySkill.skillId,

          required:
            opportunitySkill.required,

          weight:
            opportunitySkill.weight,

          /**
           * Your schema now stores the requirement
           * as a competency level.
           *
           * The existing gap engine still expects
           * a numeric minimumProficiency.
           *
           * So we convert it internally.
           */
          minimumProficiency:
            COMPETENCY_PROFICIENCY[
              opportunitySkill.requiredLevel
            ],
        })
      );

    // 10. Calculate Gap Engine result

    const gapAnalysis =
      calculateGapAnalysis(
        studentSkillsForGap,
        opportunitySkillsForGap
      );

    // 11. Build detailed skill information

    const detailedGapAnalysis =
      gapAnalysis.skills.map((gap) => {
        const opportunitySkill =
          opportunity.skills.find(
            (item) =>
              item.skillId ===
              gap.skillId
          );

        const studentSkill =
          trustedSkills.find(
            (skill) =>
              skill.skillId ===
              gap.skillId
          );

        const requiredLevel =
          opportunitySkill?.requiredLevel ??
          "FOUNDATIONAL";

        const trustedProficiency =
          studentSkill?.trustedProficiency ??
          0;

        const studentLevel =
          proficiencyToCompetencyLevel(
            trustedProficiency
          );

        return {
          skillId: gap.skillId,

          skillName:
            opportunitySkill?.skill.name ??
            "Unknown",

          category:
            opportunitySkill?.skill.category ??
            null,

          /**
           * Trusted proficiency is used for
           * readiness calculations.
           */
          studentProficiency:
            trustedProficiency,

          /**
           * Keep the old numeric gap information
           * because your detail page currently uses it.
           */
          requiredProficiency:
            gap.requiredProficiency,

          gap: gap.gap,

          weight:
            opportunitySkill?.weight ??
            gap.weight,

          required:
            opportunitySkill?.required ??
            gap.required,

          /**
           * NEW:
           * Actual requirement from Prisma.
           */
          requiredLevel,

          /**
           * NEW:
           * Student's calculated competency level.
           */
          studentLevel,

          /**
           * Useful transparency fields.
           */
          claimedProficiency:
            studentSkill?.claimedProficiency ??
            0,

          evidenceCount:
            studentSkill?.evidenceCount ??
            0,

          verifiedEvidenceCount:
            studentSkill
              ?.verifiedEvidenceCount ??
            0,

          confidence:
            studentSkill?.confidence ??
            0,

          status: gap.status,
        };
      });

    // 12. Return structured opportunity

    return NextResponse.json({
      success: true,

      opportunity: {
        id: opportunity.id,

        title: opportunity.title,

        company: opportunity.company,

        description:
          opportunity.description,

        location:
          opportunity.location,

        type:
          opportunity.type,

        createdAt:
          opportunity.createdAt,

        industry:
          opportunity.industry,

        skills:
          opportunity.skills.map(
            (item) => ({
              id: item.skill.id,

              name:
                item.skill.name,

              category:
                item.skill.category,

              required:
                item.required,

              /**
               * NEW:
               * Actual competency requirement.
               */
              requiredLevel:
                item.requiredLevel,

              weight:
                item.weight,
            })
          ),

        gapAnalysis:
          detailedGapAnalysis,

        readinessScore:
          gapAnalysis.readinessScore,

        strongSkills:
          gapAnalysis.strongSkills.length,

        moderateSkills:
          gapAnalysis.moderateSkills.length,

        gapSkills:
          gapAnalysis.gapSkills.length,
      },
    });
  } catch (error) {
    console.error(
      "STUDENT_OPPORTUNITY_DETAIL_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch opportunity.",
      },
      {
        status: 500,
      }
    );
  }
}