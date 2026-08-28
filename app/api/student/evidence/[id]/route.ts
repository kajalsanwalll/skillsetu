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

    // Get the SkillSetu user
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

    // Only faculty, industry, and admin can verify evidence.
    if (
      user.role !== "FACULTY" &&
      user.role !== "INDUSTRY" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Only authorized reviewers can verify evidence.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const body = await req.json();

    const requestedStrength =
      body.verificationStrength as VerificationStrength;

    const verified = body.verified === true;

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

    // Find the evidence
    const evidence =
      await prisma.skillEvidence.findUnique({
        where: {
          id,
        },
        include: {
          skill: true,
          studentProfile: true,
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

    // Update verification
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
        "Evidence verification updated successfully.",
      evidence: updatedEvidence,
    });
  } catch (error) {
    console.error(
      "EVIDENCE_VERIFICATION_ERROR:",
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