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
            skills: {
              include: {
                skill: true,
              },
              orderBy: {
                skill: {
                  name: "asc",
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can access student skills.",
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

    return NextResponse.json({
      skills: user.studentProfile.skills,
    });
  } catch (error) {
    console.error(
      "STUDENT_SKILLS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch skills.",
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can add skills.",
        },
        { status: 403 }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error:
            "Student profile not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const skillName =
      typeof body.skillName === "string"
        ? body.skillName.trim()
        : "";

    const proficiency = Number(
      body.proficiency
    );

    if (!skillName) {
      return NextResponse.json(
        {
          error: "Skill name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(proficiency) ||
      proficiency < 0 ||
      proficiency > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Proficiency must be between 0 and 100.",
        },
        { status: 400 }
      );
    }

    // Normalize skill name for lookup.
    const normalizedSkillName = skillName
      .replace(/\s+/g, " ")
      .trim();

    // Reuse existing skill or create it.
    const skill = await prisma.skill.upsert({
      where: {
        name: normalizedSkillName,
      },
      update: {},
      create: {
        name: normalizedSkillName,
      },
    });

    // Create or update student's skill.
    const studentSkill =
      await prisma.studentSkill.upsert({
        where: {
          studentProfileId_skillId: {
            studentProfileId:
              user.studentProfile.id,
            skillId: skill.id,
          },
        },
        update: {
          proficiency,
        },
        create: {
          studentProfileId:
            user.studentProfile.id,
          skillId: skill.id,
          proficiency,
          verificationStrength:
            "UNVERIFIED",
        },
        include: {
          skill: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Skill added successfully.",
        skill: studentSkill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "STUDENT_SKILL_POST_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to add skill.",
      },
      { status: 500 }
    );
  }
}