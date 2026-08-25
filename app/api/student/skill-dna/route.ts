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
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "SkillSetu user not found" },
        { status: 404 }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const skills = user.studentProfile.skills.map((studentSkill) => ({
      id: studentSkill.skill.id,
      name: studentSkill.skill.name,
      category: studentSkill.skill.category,
      proficiency: studentSkill.proficiency,
      verificationStrength:
        studentSkill.verificationStrength,
    }));

    return NextResponse.json({
      student: {
        id: user.id,
        name: user.name,
      },
      skills,
    });
  } catch (error) {
    console.error("SKILL_DNA_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch Skill DNA" },
      { status: 500 }
    );
  }
}