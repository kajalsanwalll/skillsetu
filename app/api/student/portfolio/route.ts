import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  secure: true,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

async function getStudent() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: clerkUserId,
    },
    include: {
      studentProfile: true,
    },
  });

  if (!user || user.role !== "STUDENT" || !user.studentProfile) {
    return null;
  }

  return user;
}

// ============================================================
// GET PORTFOLIO
// ============================================================

export async function GET() {
  try {
    const user = await getStudent();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized or student profile not found.",
        },
        { status: 401 }
      );
    }

    const profile = await prisma.studentProfile.findUnique({
      where: {
        id: user.studentProfile!.id,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
          orderBy: {
            proficiency: "desc",
          },
        },

        evidence: {
          include: {
            skill: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        academicCredentials: {
          orderBy: {
            createdAt: "desc",
          },
        },

        assessments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Portfolio not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      portfolio: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },

        profile: {
          id: profile.id,
          careerInterest: profile.careerInterest,
          bio: profile.bio,

          resume: profile.resumeUrl
            ? {
                url: profile.resumeUrl,
                publicId: profile.resumePublicId,
                fileName: profile.resumeFileName,
                uploadedAt: profile.resumeUploadedAt,
              }
            : null,
        },

        skills: profile.skills.map((item) => ({
          id: item.id,
          name: item.skill.name,
          category: item.skill.category,
          description: item.skill.description,
          proficiency: item.proficiency,
          competencyLevel: item.competencyLevel,
          verificationStrength: item.verificationStrength,
        })),

        evidence: profile.evidence.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          url: item.url,
          score: item.score,
          verified: item.verified,
          verificationStrength: item.verificationStrength,
          skill: item.skill
            ? {
                id: item.skill.id,
                name: item.skill.name,
              }
            : null,
          createdAt: item.createdAt,
        })),

        academicCredentials:
          profile.academicCredentials.map((item) => ({
            id: item.id,
            source: item.source,
            credentialId: item.credentialId,
            title: item.title,
            institution: item.institution,
            score: item.score,
            credits: item.credits,
            issueDate: item.issueDate,
            verificationUrl: item.verificationUrl,
            verified: item.verified,
            verificationStrength:
              item.verificationStrength,
          })),

        assessments: profile.assessments.map((item) => ({
          id: item.id,
          title: item.title,
          score: item.score,
          createdAt: item.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/student/portfolio:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: errorMessage(error),
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST
// ============================================================

export async function POST(request: Request) {
  try {
    const user = await getStudent();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const contentType =
      request.headers.get("content-type") || "";

    // ========================================================
    // MULTIPART — RESUME / EVIDENCE FILE
    // ========================================================

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const action = String(
        formData.get("action") || "resume"
      );

      const file =
        formData.get("file") ??
        formData.get("resume");

      if (!(file instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            error: "Please select a file.",
          },
          { status: 400 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "The uploaded file is empty.",
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: "File must be smaller than 10 MB.",
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ======================================================
      // RESUME
      // ======================================================

      if (action === "resume") {
        if (file.type !== "application/pdf") {
          return NextResponse.json(
            {
              success: false,
              error: "Resume must be a PDF.",
            },
            { status: 400 }
          );
        }

        const uploadResult =
          await new Promise<{
            secure_url: string;
            public_id: string;
          }>((resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "skillsetu/resumes",
                  resource_type: "raw",
                  use_filename: true,
                  unique_filename: true,
                },
                (
                  error: unknown,
                  result:
                    | {
                        secure_url?: string;
                        public_id?: string;
                      }
                    | undefined
                ) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  if (
                    !result?.secure_url ||
                    !result.public_id
                  ) {
                    reject(
                      new Error(
                        "Invalid Cloudinary response."
                      )
                    );
                    return;
                  }

                  resolve({
                    secure_url:
                      result.secure_url,
                    public_id:
                      result.public_id,
                  });
                }
              );

            stream.end(buffer);
          });

        const oldPublicId =
          user.studentProfile!.resumePublicId;

        const updated =
          await prisma.studentProfile.update({
            where: {
              id: user.studentProfile!.id,
            },

            data: {
              resumeUrl:
                uploadResult.secure_url,

              resumePublicId:
                uploadResult.public_id,

              resumeFileName:
                file.name,

              resumeUploadedAt:
                new Date(),
            },
          });

        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(
              oldPublicId,
              {
                resource_type: "raw",
              }
            );
          } catch (error) {
            console.error(
              "Old resume deletion failed:",
              error
            );
          }
        }

        return NextResponse.json({
          success: true,

          message:
            "Resume uploaded successfully.",

          resume: {
            url: updated.resumeUrl,
            publicId:
              updated.resumePublicId,
            fileName:
              updated.resumeFileName,
            uploadedAt:
              updated.resumeUploadedAt,
          },
        });
      }

      // ======================================================
      // EVIDENCE FILE
      // ======================================================

      if (action === "evidence") {
        const title = String(
          formData.get("title") || ""
        );

        const description =
          String(
            formData.get("description") || ""
          ) || null;

        const type = String(
          formData.get("type") || "PROJECT"
        );

        const skillId =
          String(
            formData.get("skillId") || ""
          ) || null;

        const externalUrl =
          String(
            formData.get("url") || ""
          ) || null;

        if (!title.trim()) {
          return NextResponse.json(
            {
              success: false,
              error: "Evidence title is required.",
            },
            { status: 400 }
          );
        }

        const allowedTypes = [
          "PROJECT",
          "CERTIFICATION",
          "INTERNSHIP",
          "ASSESSMENT",
          "NPTEL",
          "SELF_REPORTED",
        ];

        if (!allowedTypes.includes(type)) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid evidence type.",
            },
            { status: 400 }
          );
        }

        let proofUrl = externalUrl;

        const uploadResult =
          await new Promise<{
            secure_url: string;
          }>((resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "skillsetu/evidence",

                  resource_type: "auto",

                  use_filename: true,

                  unique_filename: true,
                },

                (
                  error: unknown,

                  result:
                    | {
                        secure_url?: string;
                      }
                    | undefined
                ) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  if (!result?.secure_url) {
                    reject(
                      new Error(
                        "Cloudinary upload failed."
                      )
                    );
                    return;
                  }

                  resolve({
                    secure_url:
                      result.secure_url,
                  });
                }
              );

            stream.end(buffer);
          });

        proofUrl =
          uploadResult.secure_url;

        const evidence =
          await prisma.skillEvidence.create({
            data: {
              studentProfileId:
                user.studentProfile!.id,

              skillId:
                skillId || "",

              type: type as any,

              title: title.trim(),

              description,

              url: proofUrl,

              verified: false,

              verificationStrength:
                "UNVERIFIED",
            },

            include: {
              skill: true,
            },
          });

        return NextResponse.json(
          {
            success: true,

            message:
              "Evidence added successfully.",

            evidence: {
              id: evidence.id,
              title: evidence.title,
              description:
                evidence.description,
              type: evidence.type,
              url: evidence.url,
              skill: evidence.skill
                ? {
                    id: evidence.skill.id,
                    name: evidence.skill.name,
                  }
                : null,
            },
          },
          { status: 201 }
        );
      }
    }

    // ========================================================
    // JSON ACTIONS
    // ========================================================

    const body = await request.json();

    // ========================================================
    // ADD SKILL
    // ========================================================

    if (body.action === "skill") {
      const skillId = String(
        body.skillId || ""
      );

      const proficiency = Number(
        body.proficiency ?? 0
      );

      const competencyLevel =
        body.competencyLevel || null;

      if (!skillId) {
        return NextResponse.json(
          {
            success: false,
            error: "Skill is required.",
          },
          { status: 400 }
        );
      }

      const skill =
        await prisma.skill.findUnique({
          where: {
            id: skillId,
          },
        });

      if (!skill) {
        return NextResponse.json(
          {
            success: false,
            error: "Skill not found.",
          },
          { status: 404 }
        );
      }

      const studentSkill =
        await prisma.studentSkill.upsert({
          where: {
            studentProfileId_skillId: {
              studentProfileId:
                user.studentProfile!.id,

              skillId,
            },
          },

          update: {
            proficiency,

            competencyLevel,

            verificationStrength:
              "UNVERIFIED",
          },

          create: {
            studentProfileId:
              user.studentProfile!.id,

            skillId,

            proficiency,

            competencyLevel,

            verificationStrength:
              "UNVERIFIED",
          },

          include: {
            skill: true,
          },
        });

      return NextResponse.json({
        success: true,

        skill: {
          id: studentSkill.id,
          name: studentSkill.skill.name,
          category:
            studentSkill.skill.category,
          proficiency:
            studentSkill.proficiency,
          competencyLevel:
            studentSkill.competencyLevel,
          verificationStrength:
            studentSkill.verificationStrength,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "POST /api/student/portfolio:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: errorMessage(error),
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE RESUME
// ============================================================

export async function DELETE() {
  try {
    const user = await getStudent();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const publicId =
      user.studentProfile!.resumePublicId;

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type: "raw",
          }
        );
      } catch (error) {
        console.error(
          "Cloudinary deletion failed:",
          error
        );
      }
    }

    await prisma.studentProfile.update({
      where: {
        id: user.studentProfile!.id,
      },

      data: {
        resumeUrl: null,
        resumePublicId: null,
        resumeFileName: null,
        resumeUploadedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resume deleted.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/student/portfolio:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: errorMessage(error),
      },
      { status: 500 }
    );
  }
}