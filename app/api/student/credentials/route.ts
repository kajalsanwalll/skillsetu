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
            academicCredentials: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can access academic credentials.",
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

    return NextResponse.json({
      credentials:
        user.studentProfile.academicCredentials,
    });
  } catch (error) {
    console.error(
      "ACADEMIC_CREDENTIALS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch academic credentials.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can add academic credentials.",
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

    const body = await request.json();

    const {
      source,
      credentialId,
      title,
      institution,
      score,
      credits,
      issueDate,
      verificationUrl,
    } = body;

    if (!source?.trim()) {
      return NextResponse.json(
        { error: "Credential source is required." },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Credential title is required." },
        { status: 400 }
      );
    }

    const numericScore =
      score !== undefined &&
      score !== null &&
      score !== ""
        ? Number(score)
        : null;

    const numericCredits =
      credits !== undefined &&
      credits !== null &&
      credits !== ""
        ? Number(credits)
        : null;

    if (
      numericScore !== null &&
      !Number.isFinite(numericScore)
    ) {
      return NextResponse.json(
        { error: "Invalid score." },
        { status: 400 }
      );
    }

    if (
      numericCredits !== null &&
      !Number.isFinite(numericCredits)
    ) {
      return NextResponse.json(
        { error: "Invalid credits." },
        { status: 400 }
      );
    }

    const credential =
      await prisma.academicCredential.create({
        data: {
          studentProfileId:
            user.studentProfile.id,

          source: source.trim(),

          credentialId:
            credentialId?.trim() || null,

          title: title.trim(),

          institution:
            institution?.trim() || null,

          score: numericScore,

          credits: numericCredits,

          issueDate: issueDate
            ? new Date(issueDate)
            : null,

          verificationUrl:
            verificationUrl?.trim() || null,

          verified: false,

          verificationStrength:
            "UNVERIFIED",
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Academic credential added successfully.",
        credential,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ACADEMIC_CREDENTIAL_POST_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to add academic credential.",
      },
      { status: 500 }
    );
  }
}