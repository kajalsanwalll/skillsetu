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

  return (
    <main className="min-h-screen bg-[#0b0b0f] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <section>
          <Link
            href="/student/dashboard"
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-sm font-medium tracking-wide text-purple-400">
            SKILL INTELLIGENCE
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Your Skill DNA
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Your Skill DNA represents the skills you
            have developed, your current proficiency
            levels, and the strength of evidence
            supporting those skills.
          </p>
        </section>

        {/* -------------------------------- */}
        {/* OVERVIEW */}
        {/* -------------------------------- */}

        <section className="grid gap-5 md:grid-cols-5">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Total Skills
            </p>

            <p className="mt-3 text-4xl font-bold">
              {skills.length}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Skills currently recorded
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Average Proficiency
            </p>

            <p className="mt-3 text-4xl font-bold">
              {averageSkill}%
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Your claimed proficiency
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] p-6">
            <p className="text-sm text-purple-300">
              Trusted Proficiency
            </p>

            <p className="mt-3 text-4xl font-bold text-purple-300">
              {averageTrustedSkill}%
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Evidence-adjusted capability
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Strong Skills
            </p>

            <p className="mt-3 text-4xl font-bold">
              {strongSkills.length}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Trusted proficiency ≥ 75%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Verified Skills
            </p>

            <p className="mt-3 text-4xl font-bold">
              {verificationPercentage}%
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Supported by evidence
            </p>
          </div>

        </section>

        {/* -------------------------------- */}
        {/* PROFILE SUMMARY */}
        {/* -------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-3">

          {/* Career Interest */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-medium text-purple-400">
              CAREER INTEREST
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {profile.careerInterest ||
                "Not specified"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your current career direction helps
              SkillSetu personalize future
              recommendations.
            </p>
          </div>

          {/* Skill Categories */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-medium text-purple-400">
              SKILL CATEGORIES
            </p>

            <p className="mt-3 text-3xl font-bold">
              {categories.length}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <span className="text-sm text-gray-500">
                  No categories yet
                </span>
              ) : (
                categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400"
                  >
                    {category}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Evidence */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-medium text-purple-400">
              SKILL EVIDENCE
            </p>

            <p className="mt-3 text-3xl font-bold">
              {evidence.length}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Evidence items connected to your
              skills.
            </p>

            <div className="mt-4 flex gap-2 text-xs">
              <span className="rounded-full border border-white/10 px-3 py-1 text-gray-400">
                {credentials.length} credentials
              </span>

              <span className="rounded-full border border-white/10 px-3 py-1 text-gray-400">
                {assessments.length} assessments
              </span>
            </div>
          </div>

        </section>

        {/* -------------------------------- */}
        {/* SKILL BREAKDOWN */}
        {/* -------------------------------- */}

        <section className="grid gap-6 md:grid-cols-3">

          {/* Strong */}

          <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-6">
            <p className="text-sm text-gray-500">
              STRONG
            </p>

            <p className="mt-2 text-3xl font-bold text-green-300">
              {strongSkills.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Trusted proficiency ≥ 75%
            </p>
          </div>

          {/* Developing */}

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.03] p-6">
            <p className="text-sm text-gray-500">
              DEVELOPING
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-300">
              {developingSkills.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Trusted proficiency 60% – 74%
            </p>
          </div>

          {/* Improvement */}

          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] p-6">
            <p className="text-sm text-gray-500">
              NEEDS IMPROVEMENT
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-300">
              {improvementSkills.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Trusted proficiency below 60%
            </p>
          </div>

        </section>

        {/* -------------------------------- */}
        {/* SKILL LIST */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div>
            <p className="text-sm font-medium text-purple-400">
              CAPABILITY PROFILE
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Your Skills
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your claimed proficiency compared with
              evidence-supported trusted proficiency.
            </p>
          </div>

          {trustedSkills.length === 0 ? (

            <div className="mt-8 rounded-xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-gray-400">
                Your Skill DNA is empty.
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Skills will appear here once they
                are added to your profile.
              </p>
            </div>

          ) : (

            <div className="mt-8 space-y-6">

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

                return (
                  <div
                    key={studentSkill.id}
                    className="rounded-xl border border-white/10 p-5"
                  >

                    {/* Skill Header */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <h3 className="font-semibold">
                          {studentSkill.skill.name}
                        </h3>

                        {studentSkill.skill.category && (
                          <p className="mt-1 text-xs text-gray-500">
                            {studentSkill.skill.category}
                          </p>
                        )}
                      </div>

                      {/* Confidence */}

                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide ${
                          studentSkill.confidence ===
                          "HIGH"
                            ? "border-green-500/20 text-green-300"
                            : studentSkill.confidence ===
                              "MEDIUM"
                            ? "border-yellow-500/20 text-yellow-300"
                            : studentSkill.confidence ===
                              "LOW"
                            ? "border-orange-500/20 text-orange-300"
                            : "border-white/10 text-gray-500"
                        }`}
                      >
                        {studentSkill.confidence}
                      </span>

                    </div>

                    {/* -------------------------------- */}
                    {/* Trusted Proficiency */}
                    {/* -------------------------------- */}

                    <div className="mt-5">

                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">
                          Trusted Proficiency
                        </span>

                        <span className="text-sm font-bold text-purple-300">
                          {trustedProficiency}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all"
                          style={{
                            width: `${trustedProficiency}%`,
                          }}
                        />
                      </div>

                    </div>

                    {/* -------------------------------- */}
                    {/* Claimed Proficiency */}
                    {/* -------------------------------- */}

                    <div className="mt-5">

                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Claimed Proficiency
                        </span>

                        <span className="text-xs text-gray-400">
                          {claimedProficiency}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gray-500"
                          style={{
                            width: `${claimedProficiency}%`,
                          }}
                        />
                      </div>

                    </div>

                    {/* -------------------------------- */}
                    {/* Evidence Information */}
                    {/* -------------------------------- */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">

                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[10px] uppercase tracking-wide text-gray-600">
                          Evidence Score
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-300">
                          {studentSkill.evidenceScore}%
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[10px] uppercase tracking-wide text-gray-600">
                          Evidence
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-300">
                          {studentSkill.evidenceCount}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                        <p className="text-[10px] uppercase tracking-wide text-gray-600">
                          Verified Evidence
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-300">
                          {studentSkill.verifiedEvidenceCount}
                        </p>
                      </div>

                    </div>

                    {/* -------------------------------- */}
                    {/* Verification Strength */}
                    {/* -------------------------------- */}

                    <div className="mt-4 flex items-center justify-between">

                      <span className="text-xs text-gray-600">
                        Verification Strength
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide ${
                          studentSkill.verificationStrength ===
                          "HIGH"
                            ? "border-green-500/20 text-green-300"
                            : studentSkill.verificationStrength ===
                              "MEDIUM"
                            ? "border-yellow-500/20 text-yellow-300"
                            : studentSkill.verificationStrength ===
                              "LOW"
                            ? "border-orange-500/20 text-orange-300"
                            : "border-white/10 text-gray-500"
                        }`}
                      >
                        {
                          studentSkill.verificationStrength
                        }
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        {/* -------------------------------- */}
        {/* VERIFICATION */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div>
            <p className="text-sm font-medium text-purple-400">
              VERIFICATION
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Evidence Strength
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              SkillSetu distinguishes between a skill
              claim and the evidence supporting that
              claim. Stronger evidence increases
              verification strength.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">

            {/* HIGH */}

            <div className="rounded-xl border border-green-500/20 bg-green-500/[0.05] p-5">
              <p className="text-xs text-gray-500">
                HIGH
              </p>

              <p className="mt-2 text-3xl font-bold text-green-300">
                {highVerification}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Strong evidence
              </p>
            </div>

            {/* MEDIUM */}

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] p-5">
              <p className="text-xs text-gray-500">
                MEDIUM
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-300">
                {mediumVerification}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Moderate evidence
              </p>
            </div>

            {/* LOW */}

            <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.05] p-5">
              <p className="text-xs text-gray-500">
                LOW
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-300">
                {lowVerification}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Limited evidence
              </p>
            </div>

            {/* UNVERIFIED */}

            <div className="rounded-xl border border-white/10 p-5">
              <p className="text-xs text-gray-500">
                UNVERIFIED
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-300">
                {unverifiedSkills}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                No verification yet
              </p>
            </div>

          </div>

        </section>

        {/* -------------------------------- */}
        {/* NAVIGATION */}
        {/* -------------------------------- */}

        <section className="grid gap-4 md:grid-cols-3">

          <Link
            href="/student/opportunities"
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/30"
          >
            <p className="text-sm font-medium text-purple-400">
              OPPORTUNITIES
            </p>

            <h3 className="mt-2 font-semibold">
              See where your skills fit →
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Explore opportunities ranked using
              your current Skill DNA.
            </p>
          </Link>

          <Link
            href="/student/gaps"
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/30"
          >
            <p className="text-sm font-medium text-purple-400">
              SKILL GAPS
            </p>

            <h3 className="mt-2 font-semibold">
              Find areas to improve →
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Identify skills where your proficiency
              is below opportunity requirements.
            </p>
          </Link>

          <Link
            href="/student/portfolio"
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/30"
          >
            <p className="text-sm font-medium text-purple-400">
              PORTFOLIO
            </p>

            <h3 className="mt-2 font-semibold">
              Build your evidence →
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Showcase projects and evidence
              supporting your skills.
            </p>
          </Link>

        </section>

      </div>
    </main>
  );
}