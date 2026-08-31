import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // -----------------------------------------
    // 1. Authenticate
    // -----------------------------------------
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // 2. Find SkillSetu user
    // -----------------------------------------
    const industryUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!industryUser) {
      return NextResponse.json(
        {
          error:
            "SkillSetu user not found. Please complete setup.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 3. Industry-only authorization
    // -----------------------------------------
    if (industryUser.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error:
            "Only industry users can view candidates.",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------
    // 4. Fetch student candidates
    // -----------------------------------------
    const candidates = await prisma.studentProfile.findMany({
      where: {
        user: {
          role: "STUDENT",
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },

        evidence: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
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
          select: {
            id: true,
            opportunityId: true,
            matchScore: true,
            status: true,
            createdAt: true,
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    // -----------------------------------------
    // 5. Return candidates
    // -----------------------------------------
    return NextResponse.json({
      success: true,
      candidates,
    });
  } catch (error) {
    console.error(
      "INDUSTRY_CANDIDATES_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch candidates.",
      },
      { status: 500 }
    );
  }
}