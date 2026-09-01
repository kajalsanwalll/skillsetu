import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // ============================================================
    // 1. Find an industry user
    // ============================================================

    const industry = await prisma.user.findFirst({
      where: {
        role: "INDUSTRY",
      },
    });

    if (!industry) {
      return NextResponse.json(
        {
          error: "No industry user exists. Create one first.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // 2. Find the skills required for this opportunity
    // ============================================================

    const skills = await prisma.skill.findMany({
      where: {
        name: {
          in: [
            "Node.js",
            "Express",
            "REST APIs",
            "PostgreSQL",
            "Docker",
            "Redis",
          ],
        },
      },
    });

    const skillMap = new Map(
      skills.map((skill) => [skill.name, skill])
    );

    // ============================================================
    // 3. Make sure all required skills exist
    // ============================================================

    const requiredSkillNames = [
      "Node.js",
      "Express",
      "REST APIs",
      "PostgreSQL",
      "Docker",
      "Redis",
    ];

    const missingSkills = requiredSkillNames.filter(
      (name) => !skillMap.has(name)
    );

    if (missingSkills.length > 0) {
      return NextResponse.json(
        {
          error: "Some required skills do not exist.",
          missingSkills,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 4. Create opportunity
    // ============================================================

    const opportunity = await prisma.opportunity.create({
      data: {
        title: "Backend Engineer Intern",

        company: "TechNova",

        description:
          "Backend engineering internship focused on APIs, databases and scalable services.",

        location: "Remote",

        type: "INTERNSHIP",

        industryId: industry.id,

        // ========================================================
        // Opportunity skills
        // ========================================================

        skills: {
          create: [
            {
              skillId: skillMap.get("Node.js")!.id,
              required: true,
              weight: 1.0,
              requiredLevel: "ADVANCED",
            },

            {
              skillId: skillMap.get("Express")!.id,
              required: true,
              weight: 0.9,
              requiredLevel: "INTERMEDIATE",
            },

            {
              skillId: skillMap.get("REST APIs")!.id,
              required: true,
              weight: 1.0,
              requiredLevel: "ADVANCED",
            },

            {
              skillId: skillMap.get("PostgreSQL")!.id,
              required: true,
              weight: 0.9,
              requiredLevel: "INTERMEDIATE",
            },

            {
              skillId: skillMap.get("Docker")!.id,
              required: false,
              weight: 0.6,
              requiredLevel: "FOUNDATIONAL",
            },

            {
              skillId: skillMap.get("Redis")!.id,
              required: false,
              weight: 0.4,
              requiredLevel: "FOUNDATIONAL",
            },
          ],
        },
      },

      // ==========================================================
      // Return created opportunity with its skills
      // ==========================================================

      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // ============================================================
    // 5. Return opportunity
    // ============================================================

    return NextResponse.json({
      opportunity,
    });
  } catch (error) {
    console.error("CREATE_OPPORTUNITY_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create opportunity",
      },
      { status: 500 }
    );
  }
}