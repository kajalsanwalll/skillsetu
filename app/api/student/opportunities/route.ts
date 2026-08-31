import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching/calculate-match";
import { calculateTrustedProficiency } from "@/lib/skills/calculate-trusted-proficiency";

/**
 * Converts an opportunity's competency requirement
 * into the numeric proficiency used by the existing
 * matching algorithm.
 *
 * These values are internal scoring thresholds.
 * The UI should display the competency level instead.
 */
const COMPETENCY_PROFICIENCY: Record<string, number> = {
  EXPOSURE: 20,
  FOUNDATIONAL: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 100,
};

/**
 * Converts a numeric trusted proficiency into
 * the corresponding competency level.
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

/**
 * Used only for comparing student level against
 * opportunity required level.
 */
const COMPETENCY_LEVEL_VALUE: Record<string, number> = {
  EXPOSURE: 1,
  FOUNDATIONAL: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  EXPERT: 5,
};

export async function GET() {
  try {
    // 1. Authenticate

    const { isAuthenticated, userId } = await auth();

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

    // 2. Get student + skills + evidence + applications

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

            applications: {
              select: {
                opportunityId: true,
              },
            },
          },
        },
      },
    });

    // 3. Validate student

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Student access required.",
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

    const profile = user.studentProfile;

    // 4. Calculate trusted proficiency for every student skill

    const trustedSkills = profile.skills.map(
      (studentSkill) => {
        const skillEvidence =
          profile.evidence.filter(
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

    // 5. Get opportunities

    const opportunities =
      await prisma.opportunity.findMany({
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

        orderBy: {
          createdAt: "desc",
        },
      });

    // 6. Calculate matching information

    const results = opportunities
      .map((opportunity) => {
        /**
         * Convert requiredLevel into the numeric
         * minimum proficiency expected by the
         * existing calculateMatchScore function.
         */
        const matchRequirements =
          opportunity.skills.map(
            (opportunitySkill) => ({
              skillId:
                opportunitySkill.skillId,

              required:
                opportunitySkill.required,

              weight:
                opportunitySkill.weight,

              minimumProficiency:
                COMPETENCY_PROFICIENCY[
                  opportunitySkill.requiredLevel
                ],
            })
          );

        /**
         * Keep using TRUSTED proficiency for
         * actual matching.
         */
        const matchScore =
          calculateMatchScore(
            trustedSkills.map(
              (studentSkill) => ({
                skillId:
                  studentSkill.skillId,

                proficiency:
                  studentSkill.trustedProficiency,
              })
            ),

            matchRequirements
          );

        // 7. Create detailed skill matching information

        const matchedSkills =
          opportunity.skills.map(
            (opportunitySkill) => {
              const studentSkill =
                trustedSkills.find(
                  (skill) =>
                    skill.skillId ===
                    opportunitySkill.skillId
                );

              const trustedProficiency =
                studentSkill?.trustedProficiency ??
                0;

              /**
               * Requirement stored in Prisma.
               *
               * Example:
               * FOUNDATIONAL
               * INTERMEDIATE
               * ADVANCED
               */
              const requiredLevel =
                opportunitySkill.requiredLevel;

              /**
               * Convert student's trusted numeric
               * proficiency into a competency level
               * for display/comparison.
               */
              const studentLevel =
                proficiencyToCompetencyLevel(
                  trustedProficiency
                );

              /**
               * Compare competency levels rather
               * than comparing arbitrary percentages.
               */
              const meetsRequirement =
                COMPETENCY_LEVEL_VALUE[
                  studentLevel
                ] >=
                COMPETENCY_LEVEL_VALUE[
                  requiredLevel
                ];

              return {
                id: opportunitySkill.skill.id,

                name:
                  opportunitySkill.skill.name,

                category:
                  opportunitySkill.skill.category,

                required:
                  opportunitySkill.required,

                weight:
                  opportunitySkill.weight,

                /**
                 * NEW:
                 * Human-readable requirement.
                 */
                requiredLevel,

                /**
                 * NEW:
                 * Student's calculated competency level.
                 */
                studentLevel,

                /**
                 * Keep trusted proficiency available
                 * for the detail page / scoring.
                 */
                trustedProficiency,

                /**
                 * Keep claimed proficiency available
                 * for transparency.
                 */
                claimedProficiency:
                  studentSkill
                    ?.claimedProficiency ?? 0,

                meetsRequirement,

                evidenceCount:
                  studentSkill
                    ?.evidenceCount ?? 0,

                verifiedEvidenceCount:
                  studentSkill
                    ?.verifiedEvidenceCount ?? 0,

                confidence:
                  studentSkill?.confidence ?? 0,
              };
            }
          );

        // 8. Check whether student already applied

        const hasApplied =
          profile.applications.some(
            (application) =>
              application.opportunityId ===
              opportunity.id
          );

        return {
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

          industry: {
            name:
              opportunity.industry.name,
          },

          skills: matchedSkills,

          matchScore,

          hasApplied,
        };
      })

      // 9. Highest matches first

      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );

    return NextResponse.json({
      success: true,
      opportunities: results,
    });
  } catch (error) {
    console.error(
      "STUDENT_OPPORTUNITIES_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load opportunities.",
      },
      {
        status: 500,
      }
    );
  }
}