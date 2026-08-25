import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a development industry user
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

  // Prevent duplicate opportunities during development
  const existing = await prisma.opportunity.findFirst({
    where: {
      title: "Backend Engineer Intern",
      company: "TechNova",
    },
  });

  if (existing) {
    console.log("Opportunity already exists:", existing.id);
    return;
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      title: "Backend Engineer Intern",
      company: "TechNova",
      description:
        "Backend engineering internship focused on APIs, databases, caching and scalable services.",
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

  console.log("Created opportunity:");
  console.log(opportunity);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());