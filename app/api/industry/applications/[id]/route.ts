import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: "User not found." },
        { status: 404 }
      );
    }

    // 3. Industry-only access
    if (user.role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error:
            "Only industry users can view candidate applications.",
        },
        { status: 403 }
      );
    }

    // 4. Get application ID
    const { id } = await params;

    // 5. Fetch application
    const application =
      await prisma.application.findUnique({
        where: {
          id,
        },
        include: {
          opportunity: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
          studentProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              skills: {
                include: {
                  skill: true,
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
              assessments: true,
              academicCredentials: true,
            },
          },
        },
      });

    // 6. Application doesn't exist
    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found.",
        },
        { status: 404 }
      );
    }

    // 7. SECURITY:
    // Make sure this application belongs to
    // an opportunity owned by this industry user.
    if (
      application.opportunity.industryId !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to view this application.",
        },
        { status: 403 }
      );
    }

    // 8. Build explainable skill match
    const studentSkills =
      application.studentProfile.skills;

    const opportunitySkills =
      application.opportunity.skills;

    const skillBreakdown =
      opportunitySkills.map(
        (opportunitySkill) => {
          const studentSkill =
            studentSkills.find(
              (skill) =>
                skill.skillId ===
                opportunitySkill.skillId
            );

          const proficiency =
            studentSkill?.proficiency ?? 0;

          const minimum =
            opportunitySkill.minimumProficiency;

          const meetsMinimum =
            proficiency >= minimum;

          const ratio =
            minimum > 0
              ? Math.min(
                  proficiency / minimum,
                  1
                )
              : proficiency > 0
              ? 1
              : 0;

          return {
            skillId:
              opportunitySkill.skillId,

            skillName:
              opportunitySkill.skill.name,

            required:
              opportunitySkill.required,

            weight:
              opportunitySkill.weight,

            minimumProficiency:
              minimum,

            candidateProficiency:
              proficiency,

            meetsMinimum,

            contribution:
              Math.round(ratio * 100),

            verificationStrength:
              studentSkill
                ?.verificationStrength ??
              "UNVERIFIED",
          };
        }
      );

    // 9. Calculate summary statistics
    const requiredSkills =
      skillBreakdown.filter(
        (skill) => skill.required
      );

    const matchedRequiredSkills =
      requiredSkills.filter(
        (skill) => skill.meetsMinimum
      );

    const optionalSkills =
      skillBreakdown.filter(
        (skill) => !skill.required
      );

    const matchedOptionalSkills =
      optionalSkills.filter(
        (skill) => skill.meetsMinimum
      );

    // 10. Return candidate information
    return NextResponse.json({
      success: true,

      application: {
        id: application.id,

        status: application.status,

        matchScore:
          application.matchScore,

        appliedAt:
          application.createdAt,
      },

      opportunity: {
        id: application.opportunity.id,

        title:
          application.opportunity.title,

        company:
          application.opportunity.company,

        description:
          application.opportunity.description,

        location:
          application.opportunity.location,

        type:
          application.opportunity.type,
      },

      candidate: {
        id:
          application.studentProfile.id,

        name:
          application.studentProfile.user.name,

        email:
          application.studentProfile.user.email,

        careerInterest:
          application.studentProfile
            .careerInterest,

        bio:
          application.studentProfile.bio,
      },

      skillBreakdown,

      summary: {
        totalSkills:
          skillBreakdown.length,

        requiredSkills:
          requiredSkills.length,

        matchedRequiredSkills:
          matchedRequiredSkills.length,

        optionalSkills:
          optionalSkills.length,

        matchedOptionalSkills:
          matchedOptionalSkills.length,
      },

      evidence:
        application.studentProfile.evidence.map(
          (item) => ({
            id: item.id,

            type: item.type,

            title: item.title,

            description:
              item.description,

            url: item.url,

            score: item.score,

            verified: item.verified,

            verificationStrength:
              item.verificationStrength,

            skill: {
              id: item.skill.id,

              name: item.skill.name,
            },

            createdAt:
              item.createdAt,
          })
        ),

      assessments:
        application.studentProfile.assessments,

      academicCredentials:
        application.studentProfile
          .academicCredentials,
    });
  } catch (error) {
    console.error(
      "INDUSTRY_APPLICATION_DETAIL_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch candidate details.",
      },
      { status: 500 }
    );
  }
}