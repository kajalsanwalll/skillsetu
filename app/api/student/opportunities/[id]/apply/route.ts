import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching/calculate-match";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // --------------------------------------------------
    // 1. Authenticate user
    // --------------------------------------------------

    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Find SkillSetu user
    // --------------------------------------------------

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
        {
          error:
            "SkillSetu user not found. Please complete setup.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Student-only authorization
    // --------------------------------------------------

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Only students can apply to opportunities.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 4. Make sure student profile exists
    // --------------------------------------------------

    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Get opportunity ID
    // --------------------------------------------------

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Opportunity ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Find opportunity
    // --------------------------------------------------

    const opportunity = await prisma.opportunity.findUnique({
      where: {
        id,
      },
      include: {
        skills: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        {
          error: "Opportunity not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 7. Check if student already applied
    // --------------------------------------------------

    const existingApplication =
      await prisma.application.findUnique({
        where: {
          studentProfileId_opportunityId: {
            studentProfileId:
              user.studentProfile.id,
            opportunityId: opportunity.id,
          },
        },
      });

    if (existingApplication) {
      return NextResponse.json(
        {
          error:
            "You have already applied to this opportunity.",
          application: existingApplication,
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 8. Calculate SkillSetu match score
    // --------------------------------------------------

    const studentSkills =
      user.studentProfile.skills.map(
        (studentSkill) => ({
          skillId: studentSkill.skillId,
          proficiency:
            studentSkill.proficiency,
        })
      );

    const opportunitySkills =
      opportunity.skills.map(
        (opportunitySkill) => ({
          skillId:
            opportunitySkill.skillId,
          required:
            opportunitySkill.required,
          weight:
            opportunitySkill.weight,
          minimumProficiency:
            opportunitySkill.minimumProficiency,
        })
      );

    const matchScore = calculateMatchScore(
      studentSkills,
      opportunitySkills
    );

    // --------------------------------------------------
    // 9. Create application
    // --------------------------------------------------

    const application =
      await prisma.application.create({
        data: {
          studentProfileId:
            user.studentProfile.id,

          opportunityId:
            opportunity.id,

          matchScore,

          status: "APPLIED",
        },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              company: true,
              type: true,
              location: true,
            },
          },
        },
      });

    // --------------------------------------------------
    // 10. Return successful application
    // --------------------------------------------------

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
      "STUDENT_APPLICATION_ERROR:",
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