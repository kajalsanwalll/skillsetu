import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INITIAL_SKILLS = [
  {
    name: "Python",
    proficiency: 82,
  },
  {
    name: "JavaScript",
    proficiency: 88,
  },
  {
    name: "TypeScript",
    proficiency: 78,
  },
  {
    name: "React",
    proficiency: 84,
  },
  {
    name: "Next.js",
    proficiency: 80,
  },
  {
    name: "Node.js",
    proficiency: 85,
  },
  {
    name: "REST APIs",
    proficiency: 82,
  },
  {
    name: "PostgreSQL",
    proficiency: 55,
  },
  {
    name: "MongoDB",
    proficiency: 70,
  },
  {
    name: "Git",
    proficiency: 86,
  },
  {
    name: "Docker",
    proficiency: 25,
  },
  {
    name: "System Design",
    proficiency: 42,
  },
];

export async function POST() {
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

    if (!user || !user.studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    for (const item of INITIAL_SKILLS) {
      const skill = await prisma.skill.findUnique({
        where: {
          name: item.name,
        },
      });

      if (!skill) {
        continue;
      }

      await prisma.studentSkill.upsert({
        where: {
          studentProfileId_skillId: {
            studentProfileId: user.studentProfile.id,
            skillId: skill.id,
          },
        },
        update: {
          proficiency: item.proficiency,
        },
        create: {
          studentProfileId: user.studentProfile.id,
          skillId: skill.id,
          proficiency: item.proficiency,
          verificationStrength: "LOW",
        },
      });
    }

    return NextResponse.json({
      message: "Skill DNA initialized",
    });
  } catch (error) {
    console.error("SKILL_DNA_INIT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to initialize Skill DNA" },
      { status: 500 }
    );
  }
}
