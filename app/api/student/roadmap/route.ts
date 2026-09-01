import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { calculateGapAnalysis } from "@/lib/matching/calculate-gap";
import { calculateTrustedProficiency } from "@/lib/skills/calculate-trusted-proficiency";

const COMPETENCY_PROFICIENCY: Record<string, number> = {
  EXPOSURE: 20,
  FOUNDATIONAL: 40,
  INTERMEDIATE: 60,
  ADVANCED: 80,
  EXPERT: 100,
};

const COMPETENCY_LEVEL_VALUE: Record<string, number> = {
  EXPOSURE: 1,
  FOUNDATIONAL: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  EXPERT: 5,
};

const COMPETENCY_LEVELS = [
  "EXPOSURE",
  "FOUNDATIONAL",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

type CompetencyLevel = (typeof COMPETENCY_LEVELS)[number];

function proficiencyToCompetencyLevel(
  proficiency: number
): CompetencyLevel {
  if (proficiency >= 90) return "EXPERT";
  if (proficiency >= 75) return "ADVANCED";
  if (proficiency >= 50) return "INTERMEDIATE";
  if (proficiency >= 25) return "FOUNDATIONAL";

  return "EXPOSURE";
}

function formatLevel(level: CompetencyLevel) {
  return (
    level.charAt(0) +
    level.slice(1).toLowerCase()
  );
}

/**
 * Generates practical learning steps for a skill gap.
 *
 * This is intentionally deterministic for now.
 * Later we can replace this with AI-generated,
 * personalized learning plans.
 */
function generateLearningSteps(
  skillName: string,
  currentLevel: CompetencyLevel,
  targetLevel: CompetencyLevel
) {
  const current =
    COMPETENCY_LEVEL_VALUE[currentLevel];

  const target =
    COMPETENCY_LEVEL_VALUE[targetLevel];

  const levelGap = target - current;

  const steps: {
    title: string;
    description: string;
    estimatedHours: number;
  }[] = [];

  if (levelGap >= 1) {
    steps.push({
      title: `Strengthen ${skillName} fundamentals`,
      description: `Review the core concepts of ${skillName} and make sure you are comfortable applying them without relying heavily on tutorials.`,
      estimatedHours: 4,
    });
  }

  if (levelGap >= 2) {
    steps.push({
      title: `Build an intermediate ${skillName} project`,
      description: `Create a small practical project using ${skillName}. Focus on applying the concepts rather than simply following an existing tutorial.`,
      estimatedHours: 8,
    });
  }

  if (levelGap >= 3) {
    steps.push({
      title: `Learn advanced ${skillName} concepts`,
      description: `Move into advanced patterns, best practices, performance considerations, and real-world problem solving with ${skillName}.`,
      estimatedHours: 8,
    });
  }

  if (levelGap >= 4) {
    steps.push({
      title: `Build a production-level ${skillName} project`,
      description: `Build a larger project that demonstrates strong practical ability in ${skillName}. Include realistic architecture, error handling, testing, and documentation where applicable.`,
      estimatedHours: 15,
    });
  }

  steps.push({
    title: `Demonstrate your ${skillName} skills`,
    description: `Complete a practical assessment, project, certification, or other verifiable evidence that demonstrates your improved ${skillName} competency.`,
    estimatedHours: 4,
  });

  return steps;
}

export async function POST(request: Request) {
  try {
    // ============================================================
    // 1. Authenticate
    // ============================================================

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

    // ============================================================
    // 2. Read request body
    // ============================================================

    let body: {
      opportunityId?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const opportunityId = body.opportunityId;

    if (!opportunityId) {
      return NextResponse.json(
        {
          error: "opportunityId is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================================
    // 3. Get student
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: {
          include: {
            skills: true,
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

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Only students can generate roadmaps.",
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

    // ============================================================
    // 4. Get opportunity
    // ============================================================

    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
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

    // ============================================================
    // 5. Calculate TRUSTED proficiency
    // ============================================================

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

          evidenceCount:
            skillEvidence.length,

          verifiedEvidenceCount:
            skillEvidence.filter(
              (evidence) =>
                evidence.verified
            ).length,

          confidence:
            result.confidence,
        };
      }
    );

    // ============================================================
    // 6. Prepare student skills for gap engine
    // ============================================================

    const studentSkillsForGap =
      trustedSkills.map(
        (studentSkill) => ({
          skillId: studentSkill.skillId,

          proficiency:
            studentSkill.trustedProficiency,
        })
      );

    // ============================================================
    // 7. Prepare opportunity requirements
    //
    // IMPORTANT:
    // calculate-gap.ts now expects requiredLevel.
    // We therefore pass BOTH:
    //
    // requiredLevel
    // minimumProficiency
    //
    // This keeps the numerical compatibility while
    // preserving the competency-level information.
    // ============================================================

    const opportunitySkillsForGap =
      opportunity.skills.map(
        (opportunitySkill) => ({
          skillId: opportunitySkill.skillId,

          required:
            opportunitySkill.required,

          weight:
            opportunitySkill.weight,

          requiredLevel:
            opportunitySkill.requiredLevel,

          minimumProficiency:
            COMPETENCY_PROFICIENCY[
              opportunitySkill.requiredLevel
            ] ?? 40,
        })
      );

    // ============================================================
    // 8. Calculate gap analysis
    // ============================================================

    const gapAnalysis =
      calculateGapAnalysis(
        studentSkillsForGap,
        opportunitySkillsForGap
      );

    // ============================================================
    // 9. Build roadmap ONLY for skills that need improvement
    // ============================================================

    const roadmapSkills =
      gapAnalysis.skills
        .filter(
          (gap) =>
            gap.status === "GAP" ||
            gap.status === "MODERATE"
        )
        .map((gap, index) => {
          const opportunitySkill =
            opportunity.skills.find(
              (skill) =>
                skill.skillId === gap.skillId
            );

          if (!opportunitySkill) {
            return null;
          }

          const studentSkill =
            trustedSkills.find(
              (skill) =>
                skill.skillId === gap.skillId
            );

          const currentProficiency =
            studentSkill?.trustedProficiency ?? 0;

          const currentLevel =
            proficiencyToCompetencyLevel(
              currentProficiency
            );

          const targetLevel =
            opportunitySkill.requiredLevel;

          const steps =
            generateLearningSteps(
              opportunitySkill.skill.name,
              currentLevel,
              targetLevel
            );

          return {
            skillId:
              opportunitySkill.skillId,

            skillName:
              opportunitySkill.skill.name,

            category:
              opportunitySkill.skill.category,

            currentLevel,

            targetLevel,

            currentProficiency,

            requiredProficiency:
              COMPETENCY_PROFICIENCY[
                targetLevel
              ] ?? 40,

            gap: Math.max(
              0,
              gap.gap
            ),

            required:
              opportunitySkill.required,

            weight:
              opportunitySkill.weight,

            status:
              gap.status,

            order:
              index + 1,

            steps,
          };
        })
        .filter(
          (
            skill
          ): skill is NonNullable<typeof skill> =>
            skill !== null
        );

    // ============================================================
    // 10. Calculate total estimated hours
    // ============================================================

    const totalEstimatedHours =
      roadmapSkills.reduce(
        (total, skill) =>
          total +
          skill.steps.reduce(
            (skillTotal, step) =>
              skillTotal +
              step.estimatedHours,
            0
          ),
        0
      );

    // ============================================================
    // 11. Return roadmap
    // ============================================================

    return NextResponse.json({
      success: true,

      roadmap: {
        opportunity: {
          id: opportunity.id,

          title:
            opportunity.title,

          company:
            opportunity.company,

          type:
            opportunity.type,

          location:
            opportunity.location,

          industry:
            opportunity.industry.name,
        },

        readinessScore:
          gapAnalysis.readinessScore,

        strongSkills:
          gapAnalysis.strongSkills.length,

        moderateSkills:
          gapAnalysis.moderateSkills.length,

        gapSkills:
          gapAnalysis.gapSkills.length,

        totalSkills:
          gapAnalysis.skills.length,

        roadmapSkills,

        totalRoadmapSkills:
          roadmapSkills.length,

        totalEstimatedHours,

        isReady:
          roadmapSkills.length === 0,

        message:
          roadmapSkills.length === 0
            ? "You already meet the required competency levels for this opportunity."
            : `You have ${
                roadmapSkills.length
              } skill${
                roadmapSkills.length === 1
                  ? ""
                  : "s"
              } to strengthen before reaching the required competency levels.`,
      },
    });
  } catch (error) {
    console.error(
      "STUDENT_ROADMAP_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate roadmap.",
      },
      {
        status: 500,
      }
    );
  }
}