import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching/calculate-match";

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
            skills: true,
          },
        },
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

    const opportunities =
      await prisma.opportunity.findMany({
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
        orderBy: {
          createdAt: "desc",
        },
      });

    const results = opportunities
      .map((opportunity) => {
        const matchScore = calculateMatchScore(
          user.studentProfile!.skills.map(
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

        return {
          id: opportunity.id,
          title: opportunity.title,
          company: opportunity.company,
          description:
            opportunity.description,
          location: opportunity.location,
          type: opportunity.type,
          createdAt:
            opportunity.createdAt,

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

          matchScore,
        };
      })
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );

    return NextResponse.json({
      success: true,
      opportunities: results,
    });
  } catch (error) {
    console.error(
      "STUDENT_OPPORTUNITIES_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load opportunities.",
      },
      { status: 500 }
    );
  }
}