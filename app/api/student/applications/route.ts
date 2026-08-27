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
        { error: "SkillSetu user not found." },
        { status: 404 }
      );
    }

    // 3. Student-only access
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Only students can view applications.",
        },
        { status: 403 }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    // 4. Get applications
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

    // 5. Return applications
    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(
      "STUDENT_APPLICATIONS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load applications.",
      },
      { status: 500 }
    );
  }
}