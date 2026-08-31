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

export async function GET() {
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
    // 2. GET USER + CURRENT STUDENT SKILLS
    // ==================================================

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

            applications: {
              select: {
                opportunityId: true,
              },
            },
          },
        },
      },
    });

    // ==================================================
    // 3. VALIDATE USER
    // ==================================================

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

    // ==================================================
    // 4. CURRENT STUDENT SKILLS
    //
    // IMPORTANT:
    // Use competencyLevel, exactly like the
    // applications API and opportunity/[id] API.
    // ==================================================

    const studentSkillInputs = profile.skills.map(
      (studentSkill) => ({
        skillId: studentSkill.skillId,

        competencyLevel:
          studentSkill.competencyLevel as
            | CompetencyLevel
            | null,
      })
    );

    // ==================================================
    // 5. GET OPPORTUNITIES
    // ==================================================

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

    // ==================================================
    // 6. CALCULATE CURRENT MATCH FOR EVERY OPPORTUNITY
    // ==================================================

    const results = opportunities
      .map((opportunity) => {
        // ----------------------------------------------
        // Opportunity requirements
        // ----------------------------------------------

        const opportunitySkillInputs =
          opportunity.skills.map(
            (requirement) => ({
              skillId: requirement.skillId,

              required: requirement.required,

              weight: requirement.weight,

              requiredLevel:
                requirement.requiredLevel as CompetencyLevel,
            })
          );

        // ----------------------------------------------
        // CURRENT MATCH SCORE
        //
        // This uses the student's CURRENT Skill DNA.
        // ----------------------------------------------

        const matchScore =
          calculateMatchScore(
            studentSkillInputs,
            opportunitySkillInputs
          );

        // ----------------------------------------------
        // CURRENT SKILL-BY-SKILL MATCH
        // ----------------------------------------------

        const skills = opportunity.skills.map(
          (requirement) => {
            const studentSkill =
              profile.skills.find(
                (skill) =>
                  skill.skillId ===
                  requirement.skillId
              );

            const studentLevel =
              (studentSkill?.competencyLevel ??
                null) as CompetencyLevel | null;

            const requiredLevel =
              requirement.requiredLevel as CompetencyLevel;

            const meetsRequirement =
              studentLevel !== null &&
              COMPETENCY_LEVEL_VALUE[
                studentLevel
              ] >=
                COMPETENCY_LEVEL_VALUE[
                  requiredLevel
                ];

            return {
              id: requirement.skill.id,

              name: requirement.skill.name,

              category:
                requirement.skill.category,

              required:
                requirement.required,

              requiredLevel,

              weight:
                requirement.weight,

              studentLevel,

              hasSkill:
                studentSkill !== undefined,

              meetsRequirement,
            };
          }
        );

        // ----------------------------------------------
        // REQUIRED SKILL GAPS
        // ----------------------------------------------

        const skillGaps = skills.filter(
          (skill) =>
            skill.required &&
            !skill.meetsRequirement
        );

        // ----------------------------------------------
        // REQUIRED SKILLS THAT ARE SATISFIED
        // ----------------------------------------------

        const matchedSkills = skills.filter(
          (skill) => skill.meetsRequirement
        );

        // ----------------------------------------------
        // ALREADY APPLIED?
        // ----------------------------------------------

        const hasApplied =
          profile.applications.some(
            (application) =>
              application.opportunityId ===
              opportunity.id
          );

        // ----------------------------------------------
        // RETURN OPPORTUNITY
        // ----------------------------------------------

        return {
          id: opportunity.id,

          title: opportunity.title,

          company: opportunity.company,

          description:
            opportunity.description,

          location:
            opportunity.location,

          type: opportunity.type,

          createdAt:
            opportunity.createdAt,

          industry: {
            name:
              opportunity.industry.name,
          },

          // IMPORTANT:
          // This is now calculated from the
          // CURRENT Skill DNA.
          matchScore,

          hasApplied,

          skills,

          matchedSkills,

          skillGaps,
        };
      })

      // ==================================================
      // 7. HIGHEST MATCHES FIRST
      // ==================================================

      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );

    // ==================================================
    // 8. RESPONSE
    // ==================================================

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