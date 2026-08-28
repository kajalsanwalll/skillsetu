import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authenticate with Clerk
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Find the SkillSetu user
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

    // 3. Only authorized reviewers can access this API
    if (
      user.role !== "FACULTY" &&
      user.role !== "INDUSTRY" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Only authorized reviewers can access evidence.",
        },
        { status: 403 }
      );
    }

    // 4. Get evidence waiting for verification
    const evidence = await prisma.skillEvidence.findMany({
      where: {
        verified: false,
      },
      include: {
        skill: true,

        studentProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    // 5. Return reviewer-friendly data
    const results = evidence.map((item) => ({
      id: item.id,

      student: {
        id: item.studentProfile.user.id,
        name: item.studentProfile.user.name,
        email: item.studentProfile.user.email,
      },

      skill: {
        id: item.skill.id,
        name: item.skill.name,
        category: item.skill.category,
      },

      type: item.type,
      title: item.title,
      description: item.description,
      url: item.url,
      score: item.score,

      verified: item.verified,
      verificationStrength:
        item.verificationStrength,

      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      success: true,
      evidence: results,
    });
  } catch (error) {
    console.error(
      "REVIEWER_EVIDENCE_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load evidence for review.",
      },
      { status: 500 }
    );
  }
}