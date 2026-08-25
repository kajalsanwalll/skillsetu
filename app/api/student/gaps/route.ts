import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateSkillGaps,
  calculateReadiness,
} from "@/lib/gap-engine";

export async function GET(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const opportunityId =
      searchParams.get("opportunityId");

    if (!opportunityId) {
      return NextResponse.json(
        {
          error: "opportunityId is required",
        },
        { status: 400 }
      );
    }

    // Get current student
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

    if (!user || !user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found",
        },
        { status: 404 }
      );
    }

    // Get opportunity
    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

    if (!opportunity) {
      return NextResponse.json(
        {
          error: "Opportunity not found",
        },
        { status: 404 }
      );
    }

    // Convert Prisma data into Gap Engine input
    const studentSkills =
      user.studentProfile.skills.map(
        (studentSkill) => ({
          skillId: studentSkill.skill.id,
          skillName: studentSkill.skill.name,
          proficiency: studentSkill.proficiency,
        })
      );

    const targetSkills =
      opportunity.skills.map(
        (opportunitySkill) => ({
          skillId: opportunitySkill.skill.id,
          skillName: opportunitySkill.skill.name,
          minimumProficiency:
            opportunitySkill.minimumProficiency,
          weight: opportunitySkill.weight,
          required: opportunitySkill.required,
        })
      );

    // Run intelligence engine
    const gaps = calculateSkillGaps(
      studentSkills,
      targetSkills
    );

    const readinessScore =
      calculateReadiness(gaps);

    const strong = gaps.filter(
      (gap) => gap.status === "STRONG"
    );

    const moderate = gaps.filter(
      (gap) => gap.status === "MODERATE"
    );

    const critical = gaps.filter(
      (gap) => gap.status === "CRITICAL"
    );

    return NextResponse.json({
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        location: opportunity.location,
        type: opportunity.type,
      },

      readinessScore,

      summary: {
        totalSkills: gaps.length,
        strong: strong.length,
        moderate: moderate.length,
        critical: critical.length,
      },

      strong,
      moderate,
      critical,

      gaps,
    });
  } catch (error) {
    console.error("GAP_API_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to calculate skill gaps",
      },
      { status: 500 }
    );
  }
}