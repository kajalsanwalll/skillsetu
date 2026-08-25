import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SKILLS } from "@/lib/skills";

export async function POST() {
  try {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    for (const skill of SKILLS) {
      await prisma.skill.upsert({
        where: {
          name: skill.name,
        },
        update: {
          category: skill.category,
          description: skill.description,
        },
        create: {
          name: skill.name,
          category: skill.category,
          description: skill.description,
        },
      });
    }

    return NextResponse.json({
      message: "Skills seeded successfully",
      count: SKILLS.length,
    });
  } catch (error) {
    console.error("SKILL_SEED_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to seed skills" },
      { status: 500 }
    );
  }
}