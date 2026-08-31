import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateMatchScore,
  type CompetencyLevel,
} from "@/lib/matching";

export async function GET() {
  try {
    // ==================================================
    // 1. AUTHENTICATE
    // ==================================================

    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ==================================================
    // 2. FIND USER + CURRENT STUDENT SKILLS
    // ==================================================

    const user = await prisma.user.findUnique({
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
        { error: "User not found." },
        { status: 404 }
      );
    }

    // ==================================================
    // 3. STUDENT-ONLY ACCESS
    // ==================================================

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can view their applications.",
        },
        { status: 403 }
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
        { status: 404 }
      );
    }

    const studentProfile = user.studentProfile;

    // ==================================================
    // 5. GET CURRENT STUDENT SKILLS
    // ==================================================

    const studentSkillInputs = studentProfile.skills.map(
      (studentSkill) => ({
        skillId: studentSkill.skillId,
        competencyLevel:
          studentSkill.competencyLevel as
            | CompetencyLevel
            | null,
      })
    );

    // ==================================================
    // 6. FETCH APPLICATIONS
    // ==================================================

    const applications =
      await prisma.application.findMany({
        where: {
          studentProfileId: studentProfile.id,
        },
        include: {
          opportunity: {
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
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    // ==================================================
    // 7. RECALCULATE CURRENT MATCH FOR EACH APPLICATION
    // ==================================================

    const results = applications.map(
      (application) => {
        const opportunity =
          application.opportunity;

        // ----------------------------------------------
        // Convert opportunity requirements into
        // calculateMatchScore input
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
        // IMPORTANT:
        // This uses the student's CURRENT skills,
        // not the skills they had when they applied.
        // ----------------------------------------------

        const currentMatchScore =
          calculateMatchScore(
            studentSkillInputs,
            opportunitySkillInputs
          );

        // ----------------------------------------------
        // CURRENT SKILL-BY-SKILL MATCH
        // ----------------------------------------------

        const currentSkills =
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
                  null) as CompetencyLevel | null;

              const requiredLevel =
                requirement.requiredLevel as CompetencyLevel;

              // ------------------------------------------------
              // Competency ordering
              // ------------------------------------------------

              const levelValue: Record<
                CompetencyLevel,
                number
              > = {
                EXPOSURE: 1,
                FOUNDATIONAL: 2,
                INTERMEDIATE: 3,
                ADVANCED: 4,
                EXPERT: 5,
              };

              const meetsRequirement =
                studentLevel !== null &&
                levelValue[studentLevel] >=
                  levelValue[requiredLevel];

              return {
                id: requirement.skill.id,

                name: requirement.skill.name,

                category:
                  requirement.skill.category,

                required:
                  requirement.required,

                weight:
                  requirement.weight,

                requiredLevel,

                studentLevel,

                hasSkill:
                  studentSkill !== undefined,

                meetsRequirement,
              };
            }
          );

        // ----------------------------------------------
        // CURRENT GAPS
        // ----------------------------------------------

        const skillGaps = currentSkills.filter(
          (skill) =>
            skill.required &&
            !skill.meetsRequirement
        );

        // ----------------------------------------------
        // CURRENTLY SATISFIED SKILLS
        // ----------------------------------------------

        const matchedSkills =
          currentSkills.filter(
            (skill) => skill.meetsRequirement
          );

        // ==================================================
        // RETURN APPLICATION
        // ==================================================

        return {
          id: application.id,

          status: application.status,

          createdAt:
            application.createdAt,

          // ----------------------------------------------
          // HISTORICAL SCORE
          //
          // Score when the application was submitted.
          // ----------------------------------------------

          appliedMatchScore:
            application.matchScore,

          // ----------------------------------------------
          // LIVE SCORE
          //
          // Score based on CURRENT Skill DNA.
          // ----------------------------------------------

          currentMatchScore,

          // Useful flag for UI
          matchImproved:
            application.matchScore !== null &&
            currentMatchScore >
              application.matchScore,

          matchDeclined:
            application.matchScore !== null &&
            currentMatchScore <
              application.matchScore,

          // ----------------------------------------------
          // CURRENT SKILL STATUS
          // ----------------------------------------------

          matchedSkills,

          skillGaps,

          skills: currentSkills,

          // ----------------------------------------------
          // OPPORTUNITY
          // ----------------------------------------------

          opportunity: {
            id: opportunity.id,

            title: opportunity.title,

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
          },
        };
      }
    );

    // ==================================================
    // 8. RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,
      applications: results,
    });
  } catch (error) {
    console.error(
      "STUDENT_APPLICATIONS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load applications.",
      },
      { status: 500 }
    );
  }
}

// ==================================================
// APPLY TO OPPORTUNITY
// ==================================================

export async function POST(
  request: Request
) {
  try {
    // ==================================================
    // 1. AUTHENTICATE
    // ==================================================

    const { isAuthenticated, userId } =
      await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ==================================================
    // 2. FIND USER + STUDENT PROFILE
    // ==================================================

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // ==================================================
    // 3. STUDENT-ONLY ACCESS
    // ==================================================

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can apply.",
        },
        { status: 403 }
      );
    }

    // ==================================================
    // 4. STUDENT PROFILE
    // ==================================================

    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error:
            "Student profile not found.",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // 5. READ OPPORTUNITY ID
    // ==================================================

    const body = await request.json();

    const opportunityId =
      body.opportunityId;

    if (
      typeof opportunityId !== "string" ||
      !opportunityId.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Opportunity ID is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // 6. FIND OPPORTUNITY
    // ==================================================

    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
        include: {
          skills: true,
        },
      });

    if (!opportunity) {
      return NextResponse.json(
        {
          error:
            "Opportunity not found.",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // 7. PREVENT DUPLICATE APPLICATION
    // ==================================================

    const existingApplication =
      await prisma.application.findFirst({
        where: {
          studentProfileId:
            user.studentProfile.id,

          opportunityId,
        },
      });

    if (existingApplication) {
      return NextResponse.json(
        {
          error:
            "You have already applied to this opportunity.",

          application:
            existingApplication,
        },
        { status: 409 }
      );
    }

    // ==================================================
    // 8. GET CURRENT STUDENT SKILLS
    // ==================================================

    const studentSkills =
      await prisma.studentSkill.findMany({
        where: {
          studentProfileId:
            user.studentProfile.id,
        },

        select: {
          skillId: true,
          competencyLevel: true,
        },
      });

    // ==================================================
    // 9. MATCHING INPUTS
    // ==================================================

    const studentSkillInputs =
      studentSkills.map(
        (skill) => ({
          skillId: skill.skillId,

          competencyLevel:
            skill.competencyLevel as
              | CompetencyLevel
              | null,
        })
      );

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
    // 10. CALCULATE MATCH SCORE
    // ==================================================

    const matchScore =
      calculateMatchScore(
        studentSkillInputs,
        opportunitySkillInputs
      );

    // ==================================================
    // 11. CREATE APPLICATION
    // ==================================================

    const application =
      await prisma.application.create({
        data: {
          studentProfileId:
            user.studentProfile.id,

          opportunityId,

          // This remains the historical
          // application-time score.
          matchScore,
        },
      });

    // ==================================================
    // 12. RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Application submitted successfully.",

        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "STUDENT_APPLY_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to submit application.",
      },
      { status: 500 }
    );
  }
}