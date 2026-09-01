import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  calculateSkillGaps,
  calculateReadiness,
} from "@/lib/gap-engine";

export async function GET(request: Request) {
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
    // 2. Get opportunity ID
    // ============================================================

    const { searchParams } = new URL(request.url);

    const opportunityId =
      searchParams.get("opportunityId");

    if (!opportunityId) {
      return NextResponse.json(
        {
          error: "opportunityId is required",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================================
    // 3. Get current student
    // ============================================================

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
          },
        },
      },
    });

    if (
      !user ||
      user.role !== "STUDENT" ||
      !user.studentProfile
    ) {
      return NextResponse.json(
        {
          error: "Student profile not found",
        },
        {
          status: 404,
        }
      );
    }

    // ============================================================
    // 4. Get opportunity
    // ============================================================

    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },

        include: {
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
          error: "Opportunity not found",
        },
        {
          status: 404,
        }
      );
    }

    // ============================================================
    // 5. Convert student skills
    // ============================================================
    //
    // Student skills already store numerical proficiency.
    //
    // Example:
    //
    // Node.js       → 85
    // PostgreSQL    → 55
    // Docker        → 25
    //
    // The gap engine works directly with these values.
    //
    // ============================================================

    const studentSkills =
      user.studentProfile.skills.map(
        (studentSkill) => ({
          skillId: studentSkill.skill.id,

          skillName: studentSkill.skill.name,

          proficiency:
            studentSkill.proficiency,
        })
      );

    // ============================================================
    // 6. Convert opportunity skills
    // ============================================================
    //
    // Prisma now stores:
    //
    // requiredLevel:
    //
    // EXPOSURE
    // FOUNDATIONAL
    // INTERMEDIATE
    // ADVANCED
    // EXPERT
    //
    // The gap engine itself converts this competency
    // level into the corresponding numeric proficiency.
    //
    // IMPORTANT:
    // We do NOT use minimumProficiency here anymore.
    //
    // ============================================================

    const targetSkills =
      opportunity.skills.map(
        (opportunitySkill) => ({
          skillId:
            opportunitySkill.skill.id,

          skillName:
            opportunitySkill.skill.name,

          requiredLevel:
            opportunitySkill.requiredLevel,

          weight:
            opportunitySkill.weight,

          required:
            opportunitySkill.required,
        })
      );

    // ============================================================
    // 7. Calculate skill gaps
    // ============================================================

    const gaps = calculateSkillGaps(
      studentSkills,
      targetSkills
    );

    // ============================================================
    // 8. Calculate readiness
    // ============================================================

    const readinessScore =
      calculateReadiness(gaps);

    // ============================================================
    // 9. Categorize gaps
    // ============================================================

    const strong = gaps.filter(
      (gap) => gap.status === "STRONG"
    );

    const moderate = gaps.filter(
      (gap) => gap.status === "MODERATE"
    );

    const critical = gaps.filter(
      (gap) => gap.status === "CRITICAL"
    );

    // ============================================================
    // 10. Return result
    // ============================================================

    return NextResponse.json({
      opportunity: {
        id: opportunity.id,

        title: opportunity.title,

        company: opportunity.company,

        location: opportunity.location,

        type: opportunity.type,
      },

      readinessScore,

      summary: {
        totalSkills: gaps.length,

        strong: strong.length,

        moderate: moderate.length,

        critical: critical.length,
      },

      strong,

      moderate,

      critical,

      gaps,
    });
  } catch (error) {
    console.error(
      "GAP_API_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to calculate skill gaps",
      },
      {
        status: 500,
      }
    );
  }
}