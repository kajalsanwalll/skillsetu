
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Authenticate user
        const { isAuthenticated, userId } = await auth();

        if (!isAuthenticated || !userId) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        // 2. Find SkillSetu user and complete student profile
        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
            include: {
                studentProfile: {
                    include: {
                        // Student skills
                        skills: {
                            include: {
                                skill: true,
                            },
                            orderBy: {
                                skill: {
                                    name: "asc",
                                },
                            },
                        },

                        // Academic credentials
                        academicCredentials: {
                            orderBy: {
                                createdAt: "desc",
                            },
                        },

                        // Skill evidence / projects
                        evidence: {
                            include: {
                                skill: true,
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        },

                        // Assessments
                        assessments: {
                            orderBy: {
                                createdAt: "desc",
                            },
                        },

                        // Applications
                        applications: {
                            include: {
                                opportunity: {
                                    include: {
                                        industry: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        },
                    },
                },
            },
        });

        // 3. User not found
        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found.",
                },
                { status: 404 }
            );
        }

        // 4. Student-only access
        if (user.role !== "STUDENT") {
            return NextResponse.json(
                {
                    error: "Only students can access their portfolio.",
                },
                { status: 403 }
            );
        }

        // 5. Student profile must exist
        if (!user.studentProfile) {
            return NextResponse.json(
                {
                    error: "Student profile not found.",
                },
                { status: 404 }
            );
        }

        const profile = user.studentProfile;

        // 6. Format skills
        const skills = profile.skills.map((studentSkill) => ({
            id: studentSkill.id,
            skillId: studentSkill.skillId,
            name: studentSkill.skill.name,
            category: studentSkill.skill.category,
            proficiency: studentSkill.proficiency,

            verificationStrength:
                studentSkill.verificationStrength,
        }));

        // 7. Format evidence / projects
        const evidence = profile.evidence.map((item) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            url: item.url,
            score: item.score,
            verified: item.verified,
            verificationStrength:
                item.verificationStrength,
            createdAt: item.createdAt,

            skill: item.skill
                ? {
                    id: item.skill.id,
                    name: item.skill.name,
                    category: item.skill.category,
                }
                : null,
        }));

        // 8. Format credentials
        const credentials =
            profile.academicCredentials.map((credential) => ({
                id: credential.id,
                source: credential.source,
                credentialId: credential.credentialId,
                title: credential.title,
                institution: credential.institution,
                score: credential.score,
                credits: credential.credits,
                issueDate: credential.issueDate,
                verificationUrl:
                    credential.verificationUrl,
                verified: credential.verified,
                verificationStrength:
                    credential.verificationStrength,
                createdAt: credential.createdAt,
            }));

        // 9. Format assessments
        const assessments = profile.assessments.map(
            (assessment) => ({
                id: assessment.id,
                score: assessment.score,
                createdAt: assessment.createdAt,
            })
        );

        // 10. Format applications
        const applications = profile.applications.map(
            (application) => ({
                id: application.id,
                status: application.status,
                matchScore: application.matchScore,
                createdAt: application.createdAt,

                opportunity: {
                    id: application.opportunity.id,
                    title: application.opportunity.title,
                    company: application.opportunity.company,
                    location: application.opportunity.location,
                    type: application.opportunity.type,

                    industry:
                        application.opportunity.industry,
                },
            })
        );

        // 11. Portfolio statistics
        const verifiedSkills = skills.filter(
            (skill) =>
                skill.verificationStrength !==
                "LOW"
        ).length;

        const verifiedEvidence = evidence.filter(
            (item) => item.verified
        ).length;

        const verifiedCredentials =
            credentials.filter(
                (credential) => credential.verified
            ).length;

        // 12. Return complete portfolio
        return NextResponse.json({
            success: true,

            portfolio: {
                student: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },

                profile: {

                    ...profile,
                },

                skills,

                evidence,

                credentials,

                assessments,

                applications,

                stats: {
                    totalSkills: skills.length,
                    verifiedSkills,

                    totalEvidence: evidence.length,
                    verifiedEvidence,

                    totalCredentials:
                        credentials.length,
                    verifiedCredentials,

                    totalApplications:
                        applications.length,
                },
            },
        });
    } catch (error) {
        console.error(
            "STUDENT_PORTFOLIO_GET_ERROR:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to fetch student portfolio.",
            },
            { status: 500 }
        );
    }
}

