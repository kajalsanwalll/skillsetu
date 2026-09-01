import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ============================================================
  // 1. Create development industry user
  // ============================================================

  const industry = await prisma.user.upsert({
    where: {
      clerkId: "dev-industry-user",
    },

    update: {},

    create: {
      clerkId: "dev-industry-user",
      name: "TechNova",
      email: "industry@technova.dev",
      role: "INDUSTRY",
    },
  });

  // ============================================================
  // 2. Find required skills
  // ============================================================

  const skillNames = [
    "Node.js",
    "Express",
    "REST APIs",
    "PostgreSQL",
    "Docker",
    "Redis",
  ];

  const skills = await prisma.skill.findMany({
    where: {
      name: {
        in: skillNames,
      },
    },
  });

  const skillMap = new Map(
    skills.map((skill) => [skill.name, skill])
  );

  // ============================================================
  // 3. Make sure all skills exist
  // ============================================================

  const missingSkills = skillNames.filter(
    (skillName) => !skillMap.has(skillName)
  );

  if (missingSkills.length > 0) {
    throw new Error(
      `Missing skills in database: ${missingSkills.join(", ")}`
    );
  }

  // ============================================================
  // 4. Prevent duplicate opportunity
  // ============================================================

  const existing = await prisma.opportunity.findFirst({
    where: {
      title: "Backend Engineer Intern",
      company: "TechNova",
    },
  });

  if (existing) {
    console.log(
      "Opportunity already exists:",
      existing.id
    );

    return;
  }

  // ============================================================
  // 5. Create opportunity
  // ============================================================

  const opportunity = await prisma.opportunity.create({
    data: {
      title: "Backend Engineer Intern",

      company: "TechNova",

      description:
        "Backend engineering internship focused on APIs, databases, caching and scalable services.",

      location: "Remote",

      type: "INTERNSHIP",

      industryId: industry.id,

      // ========================================================
      // Required skills
      //
      // Current SkillSetu system:
      //
      // EXPOSURE
      // FOUNDATIONAL
      // INTERMEDIATE
      // ADVANCED
      // EXPERT
      //
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

            requiredLevel: "INTERMEDIATE",
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

    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  // ============================================================
  // 6. Output
  // ============================================================

  console.log(
    "Created opportunity successfully:"
  );

  console.log(
    JSON.stringify(
      opportunity,
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(
      "SEED_OPPORTUNITY_ERROR:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });