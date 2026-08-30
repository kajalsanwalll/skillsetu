import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateMatchScore,
  type CompetencyLevel,
} from "@/lib/matching";

export async function GET() {
  try {
    // 1. Authenticate
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Find SkillSetu user
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

    // 3. Student-only access
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can view their applications.",
        },
        { status: 403 }
      );
    }

    // 4. Student profile must exist
    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    // 5. Fetch student's applications
    const applications =
      await prisma.application.findMany({
        where: {
          studentProfileId: user.studentProfile.id,
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

    // 6. Return clean application data
    const results = applications.map(
      (application) => ({
        id: application.id,
        status: application.status,
        matchScore: application.matchScore,
        createdAt: application.createdAt,

        opportunity: {
          id: application.opportunity.id,
          title: application.opportunity.title,
          company: application.opportunity.company,
          description:
            application.opportunity.description,
          location:
            application.opportunity.location,
          type: application.opportunity.type,
          createdAt:
            application.opportunity.createdAt,

          industry:
            application.opportunity.industry,

          skills:
            application.opportunity.skills.map(
              (item) => ({
                id: item.skill.id,
                name: item.skill.name,
                category: item.skill.category,

                required: item.required,

                requiredLevel:
                  item.requiredLevel,

                weight: item.weight,
              })
            ),
        },
      })
    );

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

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Find SkillSetu user + student profile
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

    // 3. Student-only access
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Only students can apply.",
        },
        { status: 403 }
      );
    }

    // 4. Student profile must exist
    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    // 5. Read opportunity ID
    const body = await request.json();

    const opportunityId = body.opportunityId;

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

    // 6. Check opportunity exists
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
          error: "Opportunity not found.",
        },
        { status: 404 }
      );
    }

    // 7. Prevent duplicate application
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
          application: existingApplication,
        },
        { status: 409 }
      );
    }

    // 8. Get student's skills
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

    // 9. Convert Prisma data into matching inputs
    const studentSkillInputs =
      studentSkills.map((skill) => ({
        skillId: skill.skillId,
        competencyLevel:
          skill.competencyLevel as
            | CompetencyLevel
            | null,
      }));

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

    // 10. Calculate match score
    const matchScore = calculateMatchScore(
      studentSkillInputs,
      opportunitySkillInputs
    );

    // 11. Create application
    const application =
      await prisma.application.create({
        data: {
          studentProfileId:
            user.studentProfile.id,
          opportunityId,
          matchScore,
        },
      });

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