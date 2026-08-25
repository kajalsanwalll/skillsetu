import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const industry = await prisma.user.findFirst({
      where: {
        role: "INDUSTRY",
      },
    });

    if (!industry) {
      return NextResponse.json(
        {
          error:
            "No industry user exists. Create one first.",
        },
        { status: 404 }
      );
    }

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

    const opportunity =
      await prisma.opportunity.create({
        data: {
          title: "Backend Engineer Intern",
          company: "TechNova",
          description:
            "Backend engineering internship focused on APIs, databases and scalable services.",
          location: "Remote",
          type: "INTERNSHIP",
          industryId: industry.id,

          skills: {
            create: [
              {
                skillId: skillMap.get("Node.js")!.id,
                required: true,
                weight: 1.0,
                minimumProficiency: 80,
              },
              {
                skillId: skillMap.get("Express")!.id,
                required: true,
                weight: 0.9,
                minimumProficiency: 70,
              },
              {
                skillId: skillMap.get("REST APIs")!.id,
                required: true,
                weight: 1.0,
                minimumProficiency: 75,
              },
              {
                skillId: skillMap.get("PostgreSQL")!.id,
                required: true,
                weight: 0.9,
                minimumProficiency: 70,
              },
              {
                skillId: skillMap.get("Docker")!.id,
                required: false,
                weight: 0.6,
                minimumProficiency: 50,
              },
              {
                skillId: skillMap.get("Redis")!.id,
                required: false,
                weight: 0.4,
                minimumProficiency: 40,
              },
            ],
          },
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

    return NextResponse.json({
      opportunity,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create opportunity",
      },
      { status: 500 }
    );
  }
}