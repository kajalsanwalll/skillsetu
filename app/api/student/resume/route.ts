import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

type MockSkill = {
  name: string;
  proficiency: number;
};

type MockProject = {
  title: string;
  description: string;
};

type MockExperience = {
  title: string;
  description: string;
  type: "INTERNSHIP" | "CERTIFICATION";
};

/**
 * MOCK RESUME EXTRACTION
 *
 * We are intentionally NOT using:
 * - pdf-parse
 * - OpenAI
 *
 * This allows the SkillSetu prototype to work
 * even when OpenAI credits are unavailable.
 */
function getMockExtraction(): {
  skills: MockSkill[];
  projects: MockProject[];
  experience: MockExperience[];
} {
  return {
    skills: [
      {
        name: "Next.js",
        proficiency: 80,
      },
      {
        name: "React",
        proficiency: 82,
      },
      {
        name: "TypeScript",
        proficiency: 75,
      },
      {
        name: "Node.js",
        proficiency: 72,
      },
      {
        name: "PostgreSQL",
        proficiency: 70,
      },
      {
        name: "Prisma",
        proficiency: 68,
      },
      {
        name: "REST APIs",
        proficiency: 78,
      },
      {
        name: "Git",
        proficiency: 80,
      },
    ],

    projects: [
      {
        title: "SkillSetu",
        description:
          "AI-powered skill intelligence platform that maps student skills to real-world opportunities and generates personalized learning roadmaps.",
      },
      {
        title: "Notesphere",
        description:
          "Full-stack notes platform built with Next.js, MongoDB and JWT authentication with an admin approval workflow for public notes.",
      },
      {
        title: "VibeCode Editor",
        description:
          "Browser-based coding environment with a file explorer and live playground for writing and previewing code.",
      },
    ],

    experience: [
      {
        title: "Software Engineering Internship",
        description:
          "Worked on backend and full-stack development involving APIs, databases and application architecture.",
        type: "INTERNSHIP",
      },
    ],
  };
}

export async function POST(request: Request) {
  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    // ============================================================
    // 2. FIND USER
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Only students can upload resumes.",
        },
        {
          status: 403,
        }
      );
    }

    if (!user.studentProfile) {
      return NextResponse.json(
        {
          error: "Student profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ============================================================
    // 3. READ RESUME
    // ============================================================

    const formData = await request.formData();

    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload a resume.",
        },
        {
          status: 400,
        }
      );
    }

    // Prototype validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Resume must be smaller than 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // We don't parse the PDF anymore.
    // We only store the uploaded file.

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    // ============================================================
    // 4. UPLOAD RESUME TO CLOUDINARY
    // ============================================================

    const uploadResult = await new Promise<any>(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "skillsetu/resumes",
              resource_type: "raw",
              public_id: `${userId}-${Date.now()}`,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        uploadStream.end(buffer);
      }
    );

    // ============================================================
    // 5. MOCK AI EXTRACTION
    // ============================================================

    const extracted = getMockExtraction();

    // ============================================================
    // 6. SAVE SKILLS
    // ============================================================

    const savedSkills: {
      id: string;
      name: string;
      proficiency: number;
    }[] = [];

    for (const extractedSkill of extracted.skills) {
      const skillName = extractedSkill.name.trim();

      if (!skillName) {
        continue;
      }

      const skill =
        await prisma.skill.upsert({
          where: {
            name: skillName,
          },
          update: {},
          create: {
            name: skillName,
          },
        });

      const proficiency = Math.min(
        100,
        Math.max(
          0,
          Number(
            extractedSkill.proficiency
          ) || 0
        )
      );

      const studentSkill =
        await prisma.studentSkill.upsert({
          where: {
            studentProfileId_skillId: {
              studentProfileId:
                user.studentProfile.id,
              skillId: skill.id,
            },
          },

          update: {
            proficiency,
          },

          create: {
            studentProfileId:
              user.studentProfile.id,
            skillId: skill.id,
            proficiency,
          },
        });

      savedSkills.push({
        id: skill.id,
        name: skill.name,
        proficiency:
          studentSkill.proficiency,
      });
    }

    // ============================================================
    // 7. SAVE PROJECTS AS EVIDENCE
    // ============================================================

    const savedProjects: MockProject[] = [];

    for (const project of extracted.projects) {
      if (!project.title?.trim()) {
        continue;
      }

      const title = project.title.trim();

      const description =
        project.description?.trim() || null;

      /**
       * For prototype:
       * associate project evidence with
       * every extracted skill.
       */
      for (const skill of savedSkills) {
        await prisma.skillEvidence.create({
          data: {
            studentProfileId:
              user.studentProfile.id,

            skillId: skill.id,

            type: "PROJECT",

            title,

            description,

            verified: false,

            verificationStrength:
              "UNVERIFIED",
          },
        });
      }

      savedProjects.push({
        title,
        description: description ?? "",
      });
    }

    // ============================================================
    // 8. SAVE EXPERIENCE
    // ============================================================

    const savedExperience: MockExperience[] = [];

    for (const item of extracted.experience) {
      if (!item.title?.trim()) {
        continue;
      }

      const title = item.title.trim();

      const description =
        item.description?.trim() || null;

      const evidenceType =
        item.type === "CERTIFICATION"
          ? "CERTIFICATION"
          : "INTERNSHIP";

      for (const skill of savedSkills) {
        await prisma.skillEvidence.create({
          data: {
            studentProfileId:
              user.studentProfile.id,

            skillId: skill.id,

            type: evidenceType,

            title,

            description,

            verified: false,

            verificationStrength:
              "UNVERIFIED",
          },
        });
      }

      savedExperience.push({
        title,
        description: description ?? "",
        type: evidenceType,
      });
    }

    // ============================================================
    // 9. RETURN
    // ============================================================

    return NextResponse.json({
      success: true,

      mode: "MOCK",

      resume: {
        url: uploadResult.secure_url,
      },

      extraction: {
        skills: savedSkills,
        projects: savedProjects,
        experience: savedExperience,
      },
    });
  } catch (error) {
    console.error(
      "RESUME_UPLOAD_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process resume.",
      },
      {
        status: 500,
      }
    );
  }
}