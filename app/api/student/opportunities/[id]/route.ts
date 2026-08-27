import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching/calculate-match";

// GET — View a single opportunity
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
            "Only students can view student opportunities.",
        },
        { status: 403 }
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
        { status: 404 }
      );
    }

    // 7. Return opportunity
    return NextResponse.json({
      success: true,
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        description: opportunity.description,
        location: opportunity.location,
        type: opportunity.type,
        createdAt: opportunity.createdAt,
        industry: opportunity.industry,

        skills: opportunity.skills.map((item) => ({
          id: item.skill.id,
          name: item.skill.name,
          category: item.skill.category,
          required: item.required,
          minimumProficiency:
            item.minimumProficiency,
          weight: item.weight,
        })),
      },
    });
  } catch (error) {
    console.error(
      "STUDENT_OPPORTUNITY_DETAIL_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch opportunity.",
      },
      { status: 500 }
    );
  }
}

// POST — Apply to an opportunity
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 3. Student-only access
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can apply for opportunities.",
        },
        { status: 403 }
      );
    }

    // 4. Make sure student profile exists
    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error:
            "Student profile not found.",
        },
        { status: 404 }
      );
    }

    // 5. Get opportunity ID
    const { id } = await params;

    // 6. Fetch opportunity and required skills
    const opportunity =
      await prisma.opportunity.findUnique({
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

    // 7. Check if already applied
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

    // 8. Calculate current Skill DNA match
    const matchScore = calculateMatchScore(
      user.studentProfile.skills.map(
        (studentSkill) => ({
          skillId: studentSkill.skillId,
          proficiency:
            studentSkill.proficiency,
        })
      ),
      opportunity.skills.map(
        (opportunitySkill) => ({
          skillId: opportunitySkill.skillId,
          required:
            opportunitySkill.required,
          weight:
            opportunitySkill.weight,
          minimumProficiency:
            opportunitySkill.minimumProficiency,
        })
      )
    );

    // 9. Create application
    const application =
      await prisma.application.create({
        data: {
          studentProfileId:
            user.studentProfile.id,
          opportunityId: opportunity.id,
          matchScore,
          status: "APPLIED",
        },
      });

    // 10. Return success
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
      "STUDENT_OPPORTUNITY_APPLY_ERROR:",
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