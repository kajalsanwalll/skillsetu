import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

                category:
                  item.skill.category,

                required: item.required,

                minimumProficiency:
                  item.minimumProficiency,

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