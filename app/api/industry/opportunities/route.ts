import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractedOpportunitySchema } from "@/lib/ai/schemas";

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

    // 2. Find SkillSetu user
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "SkillSetu user not found. Please complete setup.",
        },
        { status: 404 }
      );
    }

    // 3. Industry-only authorization
    if (user.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error:
            "Only industry users can create opportunities.",
        },
        { status: 403 }
      );
    }

    // 4. Read request body
    const body = await request.json();

    // 5. Validate opportunity
    const parsed =
      extractedOpportunitySchema.safeParse(body);

    if (!parsed.success) {
      console.error(
        "INVALID_OPPORTUNITY_DATA:",
        parsed.error.flatten()
      );

      return NextResponse.json(
        {
          error: "Invalid opportunity data.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 6. Create/reuse Skills
    // Intentionally outside a transaction to avoid
    // long-running interactive transactions with Neon.
    const skillRecords = [];

    for (const extractedSkill of data.skills) {
      const skill = await prisma.skill.upsert({
        where: {
          name: extractedSkill.name.trim(),
        },
        update: {
          category: extractedSkill.category.trim(),
        },
        create: {
          name: extractedSkill.name.trim(),
          category: extractedSkill.category.trim(),
        },
      });

      skillRecords.push({
        skillId: skill.id,
        required: extractedSkill.required,
        weight: extractedSkill.weight,
        requiredLevel: extractedSkill.requiredLevel,
      });
    }

    // 7. Create Opportunity
    const opportunity =
      await prisma.opportunity.create({
        data: {
          title: data.title.trim(),
          company: data.company.trim(),
          description: data.description.trim(),
          location: data.location?.trim() || null,
          type: data.type,
          industryId: user.id,

          skills: {
            create: skillRecords,
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

    // 8. Return result
    return NextResponse.json(
      {
        success: true,
        message:
          "Opportunity created successfully.",
        opportunity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "OPPORTUNITY_CREATE_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create opportunity.",
      },
      { status: 500 }
    );
  }
}

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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error:
            "Only industry users can view industry opportunities.",
        },
        { status: 403 }
      );
    }

    const opportunities =
      await prisma.opportunity.findMany({
        where: {
          industryId: user.id,
        },

        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          applications: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      opportunities,
    });
  } catch (error) {
    console.error(
      "INDUSTRY_OPPORTUNITIES_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch opportunities.",
      },
      { status: 500 }
    );
  }
}
