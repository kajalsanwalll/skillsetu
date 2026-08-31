import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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
    // 2. Find Industry user
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
    // 4. Get candidate ID
    // -----------------------------------------
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Candidate ID is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 5. Fetch candidate
    // -----------------------------------------
    const candidate =
      await prisma.studentProfile.findUnique({
        where: {
          id,
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
                  description: true,
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
            include: {
              opportunity: {
                select: {
                  id: true,
                  title: true,
                  company: true,
                  type: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    // -----------------------------------------
    // 6. Candidate not found
    // -----------------------------------------
    if (!candidate) {
      return NextResponse.json(
        {
          error: "Candidate not found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 7. Make sure this is actually a student
    // -----------------------------------------
    if (candidate.user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Candidate is not a student.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 8. Return candidate
    // -----------------------------------------
    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error(
      "INDUSTRY_CANDIDATE_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch candidate.",
      },
      { status: 500 }
    );
  }
}