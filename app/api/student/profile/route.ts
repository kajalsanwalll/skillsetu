import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
            evidence: {
              include: {
                skill: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            assessments: {
              orderBy: {
                createdAt: "desc",
              },
            },
            academicCredentials: {
              orderBy: {
                createdAt: "desc",
              },
            },
            applications: {
              include: {
                opportunity: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can access the student profile.",
        },
        { status: 403 }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    const opportunityCount = await prisma.opportunity.count();

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: user.studentProfile,
      opportunityCount,
    });
  } catch (error) {
    console.error(
      "STUDENT_PROFILE_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch student profile.",
      },
      { status: 500 }
    );
  }
}