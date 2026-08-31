import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // 3. Industry-only access
    if (user.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error:
            "Only industry users can view applicants.",
        },
        { status: 403 }
      );
    }

    // 4. Get opportunity ID
    const { id } = await params;

    // 5. Verify opportunity ownership
    const opportunity =
      await prisma.opportunity.findFirst({
        where: {
          id,
          industryId: user.id,
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

    // 6. Fetch applicants
    const applications =
      await prisma.application.findMany({
        where: {
          opportunityId: opportunity.id,
        },
        include: {
          studentProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
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

        orderBy: [
          {
            matchScore: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    // 7. Shape response
    const applicants = applications.map(
      (application) => ({
        applicationId: application.id,
        status: application.status,
        matchScore: application.matchScore,
        appliedAt: application.createdAt,

        student: {
          id: application.studentProfile.id,
          name: application.studentProfile.user.name,
          email: application.studentProfile.user.email,
        },

        skills:
          application.studentProfile.skills.map(
            (studentSkill) => ({
              id: studentSkill.id,
              skillId: studentSkill.skill.id,
              name: studentSkill.skill.name,
              category: studentSkill.skill.category,

              competencyLevel:
                studentSkill.competencyLevel,

              verificationStrength:
                studentSkill.verificationStrength,
            })
          ),
      })
    );

    // 8. Return applicants
    return NextResponse.json({
      success: true,

      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
      },

      totalApplicants: applicants.length,
      applicants,
    });
  } catch (error) {
    console.error(
      "INDUSTRY_APPLICANTS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch applicants.",
      },
      { status: 500 }
    );
  }
}