import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { calculateTrustedProficiency } from "@/lib/skills/calculate-trusted-proficiency";

export default async function SkillDNAPage() {
  // -----------------------------------------
  // 1. Authenticate
  // -----------------------------------------

  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect("/sign-in");
  }

  // -----------------------------------------
  // 2. Fetch student + Skill DNA
  // -----------------------------------------

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },

    include: {
      studentProfile: {
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
      },
    },
  });

  // -----------------------------------------
  // 3. Student validation
  // -----------------------------------------

  if (
    !user ||
    user.role !== "STUDENT" ||
    !user.studentProfile
  ) {
    redirect("/setup");
  }

  const profile = user.studentProfile;

  const skills = profile.skills;
  const evidence = profile.evidence;
  const credentials = profile.academicCredentials;
  const assessments = profile.assessments;

  // -----------------------------------------
  // 4. Calculate trusted proficiency
  // -----------------------------------------

  const trustedSkills = skills.map((studentSkill) => {
    const skillEvidence = evidence.filter(
      (item) => item.skillId === studentSkill.skillId
    );

    const result = calculateTrustedProficiency({
      claimedProficiency: studentSkill.proficiency,

      evidence: skillEvidence.map((item) => ({
        score: item.score,
        verified: item.verified,
        verificationStrength:
          item.verificationStrength,
      })),
    });

    return {
      ...studentSkill,

      claimedProficiency:
        result.claimedProficiency,

      evidenceScore:
        result.evidenceScore,

      trustedProficiency:
        result.trustedProficiency,

      confidence:
        result.confidence,

      evidenceCount:
        skillEvidence.length,

      verifiedEvidenceCount:
        skillEvidence.filter(
          (item) => item.verified
        ).length,
    };
  });

  // -----------------------------------------
  // 5. Skill statistics
  // -----------------------------------------

  const averageSkill =
    skills.length > 0
      ? Math.round(
          skills.reduce(
            (sum, skill) =>
              sum + skill.proficiency,
            0
          ) / skills.length
        )
      : 0;

  const averageTrustedSkill =
    trustedSkills.length > 0
      ? Math.round(
          trustedSkills.reduce(
            (sum, skill) =>
              sum + skill.trustedProficiency,
            0
          ) / trustedSkills.length
        )
      : 0;

  const strongSkills = trustedSkills.filter(
    (skill) =>
      skill.trustedProficiency >= 75
  );

  const developingSkills = trustedSkills.filter(
    (skill) =>
      skill.trustedProficiency >= 60 &&
      skill.trustedProficiency < 75
  );

  const improvementSkills = trustedSkills.filter(
    (skill) =>
      skill.trustedProficiency < 60
  );

  // -----------------------------------------
  // 6. Verification statistics
  // -----------------------------------------

  const highVerification = skills.filter(
    (skill) =>
      skill.verificationStrength === "HIGH"
  ).length;

  const mediumVerification = skills.filter(
    (skill) =>
      skill.verificationStrength === "MEDIUM"
  ).length;

  const lowVerification = skills.filter(
    (skill) =>
      skill.verificationStrength === "LOW"
  ).length;

  const unverifiedSkills = skills.filter(
    (skill) =>
      skill.verificationStrength ===
      "UNVERIFIED"
  ).length;

  const verifiedCount =
    highVerification +
    mediumVerification +
    lowVerification;

  const verificationPercentage =
    skills.length > 0
      ? Math.round(
          (verifiedCount / skills.length) * 100
        )
      : 0;

  // -----------------------------------------
  // 7. Categories
  // -----------------------------------------

  const categories = Array.from(
    new Set(
      skills
        .map(
          (skill) =>
            skill.skill.category
        )
        .filter(Boolean)
    )
  );

  // -----------------------------------------
  // 8. Page
  // -----------------------------------------

  const TEAL = "#2BA792";
  const MARIGOLD = "#F4A93B";
  const ROSE = "#E8598B";
  const MUTED = "#9AA3C0";

  const confidenceColor: Record<string, string> = {
    HIGH: TEAL,
    MEDIUM: MARIGOLD,
    LOW: ROSE,
  };

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <section>
          <Link
            href="/student/dashboard"
            className="text-sm text-[#9AA3C0] hover:text-[#C7CCE0]"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-sm font-medium tracking-wide text-[#F4A93B]">
            SKILL INTELLIGENCE
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Your Skill DNA
          </h1>

          <p className="mt-3 max-w-2xl text-[#9AA3C0]">
            What you claim, and what your evidence actually
            supports.
          </p>
        </section>

        {/* -------------------------------- */}
        {/* PRIMARY STATS */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

            <div className="flex gap-10">
              <div>
                <p className="text-sm text-[#9AA3C0]">
                  Trusted Proficiency
                </p>
                <p className="mt-2 text-5xl font-bold text-[#F4A93B]">
                  {averageTrustedSkill}%
                </p>
                <p className="mt-2 text-xs text-[#9AA3C0]">
                  Evidence-adjusted capability
                </p>
              </div>

              <div className="border-l border-[#232B47] pl-10">
                <p className="text-sm text-[#9AA3C0]">
                  Claimed Proficiency
                </p>
                <p className="mt-2 text-5xl font-bold text-[#5B6488]">
                  {averageSkill}%
                </p>
                <p className="mt-2 text-xs text-[#9AA3C0]">
                  What you reported yourself
                </p>
              </div>
            </div>

            <div className="flex gap-6 border-t border-[#232B47] pt-5 md:border-t-0 md:border-l md:pl-8 md:pt-0">
              <MiniStat label="Skills" value={skills.length} />
              <MiniStat label="Categories" value={categories.length} />
              <MiniStat label="Evidence" value={evidence.length} />
              <MiniStat label="Verified" value={`${verificationPercentage}%`} />
            </div>

          </div>

          {/* Proficiency distribution */}
          <div className="mt-8">
            <SegmentedBar
              label="Proficiency tier"
              segments={[
                { label: "Strong (≥75%)", count: strongSkills.length, color: TEAL },
                { label: "Developing (60–74%)", count: developingSkills.length, color: MARIGOLD },
                { label: "Needs work (<60%)", count: improvementSkills.length, color: ROSE },
              ]}
            />
          </div>

          {/* Evidence strength distribution */}
          <div className="mt-6">
            <SegmentedBar
              label="Evidence strength"
              segments={[
                { label: "High", count: highVerification, color: TEAL },
                { label: "Medium", count: mediumVerification, color: MARIGOLD },
                { label: "Low", count: lowVerification, color: ROSE },
                { label: "Unverified", count: unverifiedSkills, color: MUTED },
              ]}
            />
          </div>

        </section>

        {/* -------------------------------- */}
        {/* PROFILE SUMMARY */}
        {/* -------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* Career Interest */}

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-sm font-medium text-[#F4A93B]">
              CAREER INTEREST
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {profile.careerInterest ||
                "Not specified"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#9AA3C0]">
              Your current career direction helps
              SkillSetu personalize future
              recommendations.
            </p>
          </div>

          {/* Skill Categories */}

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-sm font-medium text-[#F4A93B]">
              SKILL CATEGORIES
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <span className="text-sm text-[#9AA3C0]">
                  No categories yet
                </span>
              ) : (
                categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-[#232B47] px-3 py-1 text-xs text-[#C7CCE0]"
                  >
                    {category}
                  </span>
                ))
              )}
            </div>

            <p className="mt-4 text-xs text-[#9AA3C0]">
              {credentials.length} credentials · {assessments.length} assessments
            </p>
          </div>

        </section>

        {/* -------------------------------- */}
        {/* SKILL LIST */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div>
            <p className="text-sm font-medium text-[#F4A93B]">
              CAPABILITY PROFILE
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Your Skills
            </h2>
          </div>

          {trustedSkills.length === 0 ? (

            <div className="mt-8 rounded-xl border border-dashed border-[#232B47] p-10 text-center">
              <p className="text-[#9AA3C0]">
                Your Skill DNA is empty.
              </p>

              <p className="mt-2 text-sm text-[#5B6488]">
                Skills will appear here once they
                are added to your profile.
              </p>
            </div>

          ) : (

            <div className="mt-8 space-y-4">

              {trustedSkills.map((studentSkill) => {

                const claimedProficiency =
                  Math.min(
                    Math.max(
                      studentSkill.claimedProficiency,
                      0
                    ),
                    100
                  );

                const trustedProficiency =
                  Math.min(
                    Math.max(
                      studentSkill.trustedProficiency,
                      0
                    ),
                    100
                  );

                const gap = claimedProficiency - trustedProficiency;
                const badgeColor =
                  confidenceColor[studentSkill.confidence] ?? MUTED;

                return (
                  <div
                    key={studentSkill.id}
                    className="rounded-xl border border-[#232B47] p-5"
                  >

                    {/* Skill Header */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <h3 className="font-semibold">
                          {studentSkill.skill.name}
                        </h3>

                        {studentSkill.skill.category && (
                          <p className="mt-1 text-xs text-[#9AA3C0]">
                            {studentSkill.skill.category}
                          </p>
                        )}
                      </div>

                      <span
                        className="w-fit rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide"
                        style={{ borderColor: `${badgeColor}40`, color: badgeColor }}
                      >
                        {studentSkill.confidence} confidence
                      </span>

                    </div>

                    {/* Trusted proficiency — the primary number */}

                    <div className="mt-4">

                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-[#C7CCE0]">
                          Trusted Proficiency
                        </span>

                        <span className="text-sm font-bold text-[#F4A93B]">
                          {trustedProficiency}%
                          {Math.abs(gap) >= 10 && (
                            <span className="ml-2 text-xs font-normal text-[#9AA3C0]">
                              ({gap > 0 ? "−" : "+"}{Math.abs(gap)} vs claimed)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#F4A93B] transition-all"
                          style={{
                            width: `${trustedProficiency}%`,
                          }}
                        />
                      </div>

                    </div>

                    {/* Evidence — one compact row instead of three boxes */}

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#9AA3C0]">
                      <span>Evidence score: <span className="text-[#C7CCE0]">{studentSkill.evidenceScore}%</span></span>
                      <span>{studentSkill.evidenceCount} evidence items</span>
                      <span>{studentSkill.verifiedEvidenceCount} verified</span>
                      <span>
                        Verification:{" "}
                        <span style={{ color: confidenceColor[studentSkill.verificationStrength] ?? MUTED }}>
                          {studentSkill.verificationStrength}
                        </span>
                      </span>
                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        {/* -------------------------------- */}
        {/* NEXT STEPS */}
        {/* -------------------------------- */}

        <section className="grid gap-4 md:grid-cols-3">

          <Link
            href="/student/opportunities"
            className="rounded-xl border border-[#232B47] bg-[#171E33]/60 p-5 transition hover:border-[#F4A93B]/40"
          >
            <p className="text-sm font-medium text-[#F4A93B]">
              OPPORTUNITIES
            </p>

            <h3 className="mt-2 font-semibold">
              See where your skills fit →
            </h3>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Explore opportunities ranked using
              your current Skill DNA.
            </p>
          </Link>

          <Link
            href="/student/gaps"
            className="rounded-xl border border-[#232B47] bg-[#171E33]/60 p-5 transition hover:border-[#F4A93B]/40"
          >
            <p className="text-sm font-medium text-[#F4A93B]">
              SKILL GAPS
            </p>

            <h3 className="mt-2 font-semibold">
              Find areas to improve →
            </h3>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Identify skills where your proficiency
              is below opportunity requirements.
            </p>
          </Link>

          <Link
            href="/student/portfolio"
            className="rounded-xl border border-[#232B47] bg-[#171E33]/60 p-5 transition hover:border-[#F4A93B]/40"
          >
            <p className="text-sm font-medium text-[#F4A93B]">
              PORTFOLIO
            </p>

            <h3 className="mt-2 font-semibold">
              Build your evidence →
            </h3>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Showcase projects and evidence
              supporting your skills.
            </p>
          </Link>

        </section>

      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-[#F5F1E8]">{value}</p>
      <p className="mt-1 text-xs text-[#9AA3C0]">{label}</p>
    </div>
  );
}

function SegmentedBar({
  label,
  segments,
}: {
  label: string;
  segments: { label: string; count: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">{label}</p>

      <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-white/5">
        {total === 0 ? (
          <div className="h-full w-full bg-white/5" />
        ) : (
          segments.map((segment) => (
            <div
              key={segment.label}
              style={{
                width: `${(segment.count / total) * 100}%`,
                backgroundColor: segment.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ))
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <span key={segment.label} className="flex items-center gap-1.5 text-xs text-[#9AA3C0]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.label}: <span className="text-[#C7CCE0]">{segment.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}