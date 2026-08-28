import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const allowedStrengths = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNVERIFIED",
] as const;

type VerificationStrength =
  (typeof allowedStrengths)[number];

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await req.json();

    const requestedStrength =
      body.verificationStrength as VerificationStrength;

    const verified =
      body.verified === true;

    if (
      !allowedStrengths.includes(
        requestedStrength
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid verification strength.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: true,
      },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Student access required.",
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

    const evidence =
      await prisma.skillEvidence.findFirst({
        where: {
          id,
          studentProfileId:
            user.studentProfile.id,
        },
      });

    if (!evidence) {
      return NextResponse.json(
        {
          error: "Evidence not found.",
        },
        { status: 404 }
      );
    }

    const updatedEvidence =
      await prisma.skillEvidence.update({
        where: {
          id: evidence.id,
        },
        data: {
          verified,
          verificationStrength:
            requestedStrength,
        },
        include: {
          skill: true,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Evidence verification updated.",
      evidence: updatedEvidence,
    });
  } catch (error) {
    console.error(
      "STUDENT_EVIDENCE_VERIFY_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update evidence verification.",
      },
      { status: 500 }
    );
  }
}