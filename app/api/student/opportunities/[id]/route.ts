import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateGapAnalysis } from "@/lib/matching/calculate-gap";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // 1. Authenticate
    const { isAuthenticated, userId } =
      await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Find SkillSetu user
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: {
          include: {
            skills: true,
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

    // 3. Student-only access
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can view student opportunities.",
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

    // 4. Get opportunity ID
    const { id } = await params;

    // 5. Fetch opportunity
    const opportunity =
      await prisma.opportunity.findUnique({
        where: {
          id,
        },
        include: {
          industry: {
            select: {
              name: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

    // 6. Opportunity not found
    if (!opportunity) {
      return NextResponse.json(
        {
          error: "Opportunity not found.",
        },
        { status: 404 }
      );
    }

    // 7. Calculate Gap Engine result
    const gapAnalysis =
      calculateGapAnalysis(
        user.studentProfile.skills.map(
          (studentSkill) => ({
            skillId: studentSkill.skillId,
            proficiency:
              studentSkill.proficiency,
          })
        ),
        opportunity.skills.map(
          (opportunitySkill) => ({
            skillId:
              opportunitySkill.skillId,
            required:
              opportunitySkill.required,
            weight:
              opportunitySkill.weight,
            minimumProficiency:
              opportunitySkill.minimumProficiency,
          })
        )
      );

    // 8. Return structured opportunity
    return NextResponse.json({
      success: true,

      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        description:
          opportunity.description,
        location: opportunity.location,
        type: opportunity.type,
        createdAt: opportunity.createdAt,

        industry: opportunity.industry,

        skills: opportunity.skills.map(
          (item) => ({
            id: item.skill.id,
            name: item.skill.name,
            category:
              item.skill.category,
            required:
              item.required,
            minimumProficiency:
              item.minimumProficiency,
            weight: item.weight,
          })
        ),

        gapAnalysis: gapAnalysis.skills.map(
          (gap) => {
            const skill =
              opportunity.skills.find(
                (item) =>
                  item.skillId ===
                  gap.skillId
              );

            return {
              skillId: gap.skillId,

              skillName:
                skill?.skill.name ?? "Unknown",

              category:
                skill?.skill.category ?? null,

              studentProficiency:
                gap.studentProficiency,

              requiredProficiency:
                gap.requiredProficiency,

              gap: gap.gap,

              weight: gap.weight,

              required: gap.required,

              status: gap.status,
            };
          }
        ),

        readinessScore:
          gapAnalysis.readinessScore,

        strongSkills:
          gapAnalysis.strongSkills.length,

        moderateSkills:
          gapAnalysis.moderateSkills.length,

        gapSkills:
          gapAnalysis.gapSkills.length,
      },
    });
  } catch (error) {
    console.error(
      "STUDENT_OPPORTUNITY_DETAIL_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch opportunity.",
      },
      { status: 500 }
    );
  }
}