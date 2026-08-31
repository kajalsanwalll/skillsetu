import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "REJECTED",
  "SELECTED",
  "COMPLETED",
] as const;

type ApplicationStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // -----------------------------------------
    // 1. Authenticate with Clerk
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

    // -----------------------------------------
    // 3. Industry-only access
    // -----------------------------------------

    if (user.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error:
            "Only industry users can update application status.",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------
    // 4. Get application ID
    // -----------------------------------------

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 5. Read request body
    // -----------------------------------------

    let body: { status?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const status = body.status;

    if (!status) {
      return NextResponse.json(
        {
          error: "Status is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 6. Validate status
    // -----------------------------------------

    if (
      !ALLOWED_STATUSES.includes(
        status as ApplicationStatus
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid application status.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 7. Find application
    // -----------------------------------------

    const application =
      await prisma.application.findUnique({
        where: {
          id,
        },
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              industryId: true,
            },
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 8. Verify opportunity ownership
    // -----------------------------------------

    if (
      application.opportunity.industryId !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to update this application.",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------
    // 9. Update application
    // -----------------------------------------

    const updatedApplication =
      await prisma.application.update({
        where: {
          id: application.id,
        },
        data: {
          status: status as ApplicationStatus,
        },
      });

    // -----------------------------------------
    // 10. Return result
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        matchScore: updatedApplication.matchScore,
        createdAt: updatedApplication.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "INDUSTRY_APPLICATION_STATUS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update application status.",
      },
      { status: 500 }
    );
  }
}