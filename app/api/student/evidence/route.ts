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
        studentProfile: true,
      },
    });

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Student access required." },
        { status: 403 }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    const evidence = await prisma.skillEvidence.findMany({
      where: {
        studentProfileId: user.studentProfile.id,
      },
      include: {
        skill: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      evidence,
    });
  } catch (error) {
    console.error("STUDENT_EVIDENCE_GET_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch skill evidence.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Student access required." },
        { status: 403 }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      skillId,
      type,
      title,
      description,
      url,
      score,
    } = body;

    if (!skillId || !type || !title) {
      return NextResponse.json(
        {
          error:
            "Skill, evidence type, and title are required.",
        },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findUnique({
      where: {
        id: skillId,
      },
    });

    if (!skill) {
      return NextResponse.json(
        {
          error: "Skill not found.",
        },
        { status: 404 }
      );
    }

    const evidence = await prisma.skillEvidence.create({
      data: {
        studentProfileId: user.studentProfile.id,
        skillId,
        type,
        title,
        description: description || null,
        url: url || null,
        score:
          score !== undefined &&
          score !== null &&
          score !== ""
            ? Number(score)
            : null,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Evidence added successfully.",
        evidence,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("STUDENT_EVIDENCE_POST_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to add skill evidence.",
      },
      { status: 500 }
    );
  }
}