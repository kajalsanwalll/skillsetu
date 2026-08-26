import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { normalizeSkillName } from "@/lib/skills/normalize";

const skillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  minimumProficiency: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  required: z.boolean(),
});

const opportunitySchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  location: z.string().nullable(),
  type: z.enum([
    "INTERNSHIP",
    "JOB",
    "PROJECT",
    "MENTORSHIP",
    "FDP",
    "RESEARCH",
    "CONSULTANCY",
    "INDUSTRIAL_TRAINING",
    "GUEST_LECTURE",
  ]),
  skills: z.array(skillSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = opportunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid opportunity data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Find the current industry user
    const industryUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!industryUser) {
      return NextResponse.json(
        {
          error: "Industry user not found",
        },
        { status: 404 }
      );
    }

    if (industryUser.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error: "Only industry users can create opportunities",
        },
        { status: 403 }
      );
    }

    // Create everything atomically
    const opportunity = await prisma.$transaction(
      async (tx) => {
        const createdOpportunity =
          await tx.opportunity.create({
            data: {
              title: data.title,
              company: data.company,
              description: data.description,
              location: data.location,
              type: data.type,
              industryId: industryUser.id,
            },
          });

        for (const inputSkill of data.skills) {
          const canonicalName =
            normalizeSkillName(inputSkill.name);

          const skill = await tx.skill.upsert({
            where: {
              name: canonicalName,
            },
            update: {},
            create: {
              name: canonicalName,
              category: inputSkill.category,
            },
          });

          await tx.opportunitySkill.create({
            data: {
              opportunityId: createdOpportunity.id,
              skillId: skill.id,
              required: inputSkill.required,
              weight: inputSkill.weight,
              minimumProficiency:
                inputSkill.minimumProficiency,
            },
          });
        }

        return tx.opportunity.findUnique({
          where: {
            id: createdOpportunity.id,
          },
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });
      }
    );

    return NextResponse.json(
      {
        success: true,
        opportunity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE_OPPORTUNITY_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create opportunity",
      },
      { status: 500 }
    );
  }
}