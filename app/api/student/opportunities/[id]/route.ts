import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateMatchScore,
  type CompetencyLevel,
} from "@/lib/matching";

const COMPETENCY_LEVEL_VALUE: Record<
  CompetencyLevel,
  number
> = {
  EXPOSURE: 1,
  FOUNDATIONAL: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  EXPERT: 5,
};

function getSkillStatus(
  studentLevel: CompetencyLevel | null,
  requiredLevel: CompetencyLevel
): "STRONG" | "MODERATE" | "GAP" {
  if (!studentLevel) {
    return "GAP";
  }

  const studentValue =
    COMPETENCY_LEVEL_VALUE[studentLevel];

  const requiredValue =
    COMPETENCY_LEVEL_VALUE[requiredLevel];

  if (studentValue >= requiredValue) {
    return "STRONG";
  }

  if (studentValue === requiredValue - 1) {
    return "MODERATE";
  }

  return "GAP";
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
    // ==================================================
    // 1. AUTHENTICATE
    // ==================================================

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

    // ==================================================
    // 2. FIND USER + CURRENT STUDENT SKILLS
    // ==================================================

    const user =
      await prisma.user.findUnique({
        where: {
          clerkId: userId,
        },
        include: {
          studentProfile: {
            include: {
              skills: true,
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

    // ==================================================
    // 3. STUDENT-ONLY ACCESS
    // ==================================================

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

    // ==================================================
    // 4. STUDENT PROFILE
    // ==================================================

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

    const studentProfile =
      user.studentProfile;

    // ==================================================
    // 5. GET OPPORTUNITY ID
    // ==================================================

    const { id } = await params;

    // ==================================================
    // 6. FETCH OPPORTUNITY
    // ==================================================

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

    // ==================================================
    // 7. OPPORTUNITY NOT FOUND
    // ==================================================

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

    // ==================================================
    // 8. CURRENT STUDENT SKILLS
    //
    // IMPORTANT:
    // This is the SAME input used by
    // /api/student/opportunities
    // and /api/student/applications.
    // ==================================================

    const studentSkillInputs =
      studentProfile.skills.map(
        (studentSkill) => ({
          skillId: studentSkill.skillId,

          competencyLevel:
            studentSkill.competencyLevel as
              | CompetencyLevel
              | null,
        })
      );

    // ==================================================
    // 9. OPPORTUNITY REQUIREMENTS
    // ==================================================

    const opportunitySkillInputs =
      opportunity.skills.map(
        (requirement) => ({
          skillId:
            requirement.skillId,

          required:
            requirement.required,

          weight:
            requirement.weight,

          requiredLevel:
            requirement.requiredLevel as CompetencyLevel,
        })
      );

    // ==================================================
    // 10. CALCULATE READINESS
    //
    // THIS IS NOW THE SAME CALCULATION AS
    // THE OPPORTUNITIES PAGE.
    // ==================================================

    const readinessScore =
      calculateMatchScore(
        studentSkillInputs,
        opportunitySkillInputs
      );

    // ==================================================
    // 11. BUILD DETAILED SKILL ANALYSIS
    // ==================================================

    const gapAnalysis =
      opportunity.skills.map(
        (requirement) => {
          const studentSkill =
            studentProfile.skills.find(
              (skill) =>
                skill.skillId ===
                requirement.skillId
            );

          const studentLevel =
            (studentSkill?.competencyLevel ??
              null) as
              | CompetencyLevel
              | null;

          const requiredLevel =
            requirement.requiredLevel as CompetencyLevel;

          const status =
            getSkillStatus(
              studentLevel,
              requiredLevel
            );

          const studentValue =
            studentLevel !== null
              ? COMPETENCY_LEVEL_VALUE[
                  studentLevel
                ]
              : 0;

          const requiredValue =
            COMPETENCY_LEVEL_VALUE[
              requiredLevel
            ];

          /*
           * Keep these numeric values for the UI.
           *
           * They are NOT used to calculate
           * readiness anymore.
           */

          const studentProficiency =
            studentValue * 20;

          const requiredProficiency =
            requiredValue * 20;

          const gap = Math.max(
            requiredProficiency -
              studentProficiency,
            0
          );

          return {
            skillId:
              requirement.skillId,

            skillName:
              requirement.skill.name,

            category:
              requirement.skill.category,

            studentProficiency,

            requiredProficiency,

            gap,

            weight:
              requirement.weight,

            required:
              requirement.required,

            requiredLevel,

            studentLevel,

            status,

            hasSkill:
              studentSkill !== undefined,

            meetsRequirement:
              status === "STRONG",
          };
        }
      );

    // ==================================================
    // 12. SUMMARY COUNTS
    // ==================================================

    const strongSkills =
      gapAnalysis.filter(
        (skill) =>
          skill.status === "STRONG"
      );

    const moderateSkills =
      gapAnalysis.filter(
        (skill) =>
          skill.status === "MODERATE"
      );

    const gapSkills =
      gapAnalysis.filter(
        (skill) =>
          skill.status === "GAP"
      );

    // ==================================================
    // 13. RETURN OPPORTUNITY
    // ==================================================

    return NextResponse.json({
      success: true,

      opportunity: {
        id: opportunity.id,

        title:
          opportunity.title,

        company:
          opportunity.company,

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

              requiredLevel:
                item.requiredLevel,

              weight:
                item.weight,
            })
          ),

        // ==================================================
        // SAME SCORE AS OPPORTUNITIES PAGE
        // ==================================================

        readinessScore,

        strongSkills:
          strongSkills.length,

        moderateSkills:
          moderateSkills.length,

        gapSkills:
          gapSkills.length,

        gapAnalysis,
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