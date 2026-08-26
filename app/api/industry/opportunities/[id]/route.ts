import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error:
            "Only industry users can view this opportunity.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const opportunity =
      await prisma.opportunity.findFirst({
        where: {
          id,
          industryId: user.id,
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          applications: {
            include: {
              studentProfile: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      opportunity,
    });
  } catch (error) {
    console.error(
      "OPPORTUNITY_DETAIL_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch opportunity.",
      },
      { status: 500 }
    );
  }
}