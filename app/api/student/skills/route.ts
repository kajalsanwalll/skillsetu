import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_LEVELS = [
  "EXPOSURE",
  "FOUNDATIONAL",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

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

    // 2. Find SkillSetu user + student skills
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

    // 3. Student-only access
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can access student skills.",
        },
        { status: 403 }
      );
    }

    // 4. Student profile must exist
    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. Student-only access
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can add skills.",
        },
        { status: 403 }
      );
    }

    // 4. Student profile must exist
    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error:
            "Student profile not found.",
        },
        { status: 404 }
      );
    }

    // 5. Read request body
    const body = await request.json();

    const skillName =
      typeof body.skillName === "string"
        ? body.skillName.trim()
        : "";

    const competencyLevel =
      typeof body.competencyLevel === "string"
        ? body.competencyLevel.toUpperCase()
        : "";

    // 6. Validate skill name
    if (!skillName) {
      return NextResponse.json(
        {
          error: "Skill name is required.",
        },
        { status: 400 }
      );
    }

    // 7. Validate competency level
    if (
      !VALID_LEVELS.includes(
        competencyLevel as (typeof VALID_LEVELS)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid competency level. Choose EXPOSURE, FOUNDATIONAL, INTERMEDIATE, ADVANCED, or EXPERT.",
        },
        { status: 400 }
      );
    }

    // 8. Normalize skill name
    const normalizedSkillName = skillName
      .replace(/\s+/g, " ")
      .trim();

    // 9. Reuse existing skill or create it
    const skill = await prisma.skill.upsert({
      where: {
        name: normalizedSkillName,
      },
      update: {},
      create: {
        name: normalizedSkillName,
      },
    });

    // 10. Create or update student's skill
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
          competencyLevel:
            competencyLevel as
              | "EXPOSURE"
              | "FOUNDATIONAL"
              | "INTERMEDIATE"
              | "ADVANCED"
              | "EXPERT",
        },

        create: {
          studentProfileId:
            user.studentProfile.id,

          skillId: skill.id,

          competencyLevel:
            competencyLevel as
              | "EXPOSURE"
              | "FOUNDATIONAL"
              | "INTERMEDIATE"
              | "ADVANCED"
              | "EXPERT",

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