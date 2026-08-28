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
            "Only industry users can view applicants.",
        },
        { status: 403 }
      );
    }

    // 4. Get opportunity ID
    const { id } = await params;

    // 5. Verify opportunity belongs to this industry user
    const opportunity =
      await prisma.opportunity.findFirst({
        where: {
          id,
          industryId: user.id,
        },
      });

    if (!opportunity) {
      return NextResponse.json(
        {
          error:
            "Opportunity not found or access denied.",
        },
        { status: 404 }
      );
    }

    // 6. Fetch applications
    const applications =
      await prisma.application.findMany({
        where: {
          opportunityId: opportunity.id,
        },
        include: {
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
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                },
              },
              evidence: {
                include: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              assessments: true,
              academicCredentials: true,
            },
          },
        },
        orderBy: [
          {
            matchScore: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    // 7. Format applicant data
    const applicants = applications.map(
      (application) => ({
        applicationId: application.id,

        status: application.status,

        matchScore: application.matchScore,

        appliedAt: application.createdAt,

        student: {
          id: application.studentProfile.id,

          name: application.studentProfile.user.name,

          email: application.studentProfile.user.email,

          careerInterest:
            application.studentProfile
              .careerInterest,

          bio: application.studentProfile.bio,

          skills:
            application.studentProfile.skills.map(
              (studentSkill) => ({
                id: studentSkill.id,

                skillId:
                  studentSkill.skill.id,

                name:
                  studentSkill.skill.name,

                category:
                  studentSkill.skill.category,

                proficiency:
                  studentSkill.proficiency,

                verificationStrength:
                  studentSkill.verificationStrength,
              })
            ),

          evidence:
            application.studentProfile.evidence.map(
              (evidence) => ({
                id: evidence.id,

                title: evidence.title,

                type: evidence.type,

                verified:
                  evidence.verified,

                verificationStrength:
                  evidence.verificationStrength,

                skill: evidence.skill
                  ? {
                      id: evidence.skill.id,
                      name: evidence.skill.name,
                    }
                  : null,
              })
            ),

          assessments:
            application.studentProfile.assessments.map(
              (assessment) => ({
                id: assessment.id,
                title: assessment.title,
                score: assessment.score,
              })
            ),

          academicCredentials:
            application.studentProfile
              .academicCredentials.map(
                (credential) => ({
                  id: credential.id,
                  source: credential.source,
                  title: credential.title,
                  institution:
                    credential.institution,
                  score: credential.score,
                  credits: credential.credits,
                  verified:
                    credential.verified,
                  verificationStrength:
                    credential.verificationStrength,
                  issueDate:
                    credential.issueDate,
                  verificationUrl:
                    credential.verificationUrl,
                })
              ),
        },
      })
    );

    // 8. Return applicants
    return NextResponse.json({
      success: true,

      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
      },

      totalApplicants: applicants.length,

      applicants,
    });
  } catch (error) {
    console.error(
      "INDUSTRY_APPLICANTS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch applicants.",
      },
      { status: 500 }
    );
  }
}