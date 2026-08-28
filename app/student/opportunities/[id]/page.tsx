
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type GapSkill = {
  skillId: string;
  skillName: string;
  category: string | null;
  studentProficiency: number;
  requiredProficiency: number;
  gap: number;
  weight: number;
  required: boolean;
  status:
    | "STRONG"
    | "MODERATE"
    | "GAP";
};

type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  type: string;
  createdAt: string;

  industry: {
    name: string;
  };

  readinessScore: number;

  strongSkills: number;
  moderateSkills: number;
  gapSkills: number;

  gapAnalysis: GapSkill[];
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const response = await fetch(
          `/api/student/opportunities/${id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load opportunity."
          );
        }

        setOpportunity(
          data.opportunity
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load opportunity."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOpportunity();
    }
  }, [id]);

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return (
<<<<<<< HEAD
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-6 py-10 text-white">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />
        </div>

        <div className="relative mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-400" />
            </div>

            <h2 className="text-lg font-semibold">
              Loading opportunity
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Fetching opportunity details...
            </p>

          </div>
=======
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-500">
            Analyzing your Skill DNA...
          </p>
>>>>>>> 3fe572762eeaea190ed8b00abd740321424a77e6
        </div>
      </main>
    );
  }

<<<<<<< HEAD
  /* =============================================
     ERROR
  ============================================= */

  if (error || !opportunity) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-6 py-10 text-white">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">

          <button
            onClick={() =>
              router.push(
                "/student/opportunities"
              )
            }
            className="mb-8 flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
          >
            <span>←</span>
            Back to Opportunities
          </button>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-xl text-red-300">
              !
            </div>

            <h2 className="text-xl font-semibold">
              Opportunity not available
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-red-300/80">
              {error ||
                "Opportunity not found."}
            </p>

=======
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
>>>>>>> 3fe572762eeaea190ed8b00abd740321424a77e6
          </div>
        </div>
      </main>
    );
  }

  if (!opportunity) {
    return null;
  }

  const strongSkills =
    opportunity.gapAnalysis.filter(
      (skill) =>
        skill.status === "STRONG"
    );

  const moderateSkills =
    opportunity.gapAnalysis.filter(
      (skill) =>
        skill.status === "MODERATE"
    );

  const gapSkills =
    opportunity.gapAnalysis.filter(
      (skill) =>
        skill.status === "GAP"
    );

  return (
<<<<<<< HEAD
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

      {/* ============================================
          BACKGROUND
      ============================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/[0.025] blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* ============================================
            TOP NAV
        ============================================ */}

        <div className="mb-8 flex items-center justify-between">

          <button
            onClick={() =>
              router.push(
                "/student/opportunities"
              )
            }
            className="group flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to Opportunities
          </button>

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold shadow-lg shadow-indigo-500/20">
              S
            </div>

            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              SkillSetu
            </span>

          </div>

        </div>

        {/* ============================================
            MAIN CARD
        ============================================ */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/20">

          {/* Header glow */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/[0.08] blur-[90px]" />

          <div className="pointer-events-none absolute -left-32 top-1/3 h-64 w-64 rounded-full bg-purple-500/[0.05] blur-[90px]" />

          {/* ==========================================
              OPPORTUNITY HEADER
          ========================================== */}

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

              {/* Information */}

              <div className="min-w-0 flex-1">

                {/* Badges */}

                <div className="mb-5 flex flex-wrap items-center gap-2">

                  <span className="rounded-full border border-indigo-400/10 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
                    {opportunity.type.replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                  {opportunity.location && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-gray-400">
                      <span>📍</span>
                      {opportunity.location}
                    </span>
                  )}

                </div>

                {/* Title */}

                <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {opportunity.title}
                </h1>

                {/* Company */}

                <p className="mt-4 text-lg font-medium text-indigo-300">
                  {opportunity.company}
                </p>

                {opportunity.industry?.name && (
                  <p className="mt-1.5 text-sm text-gray-500">
                    Posted by{" "}
                    <span className="text-gray-400">
                      {opportunity.industry.name}
                    </span>
                  </p>
=======
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/student/opportunities"
            )
          }
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to opportunities
        </button>

        {/* Header */}
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                {opportunity.type.replaceAll(
                  "_",
                  " "
>>>>>>> 3fe572762eeaea190ed8b00abd740321424a77e6
                )}
              </span>

<<<<<<< HEAD
              </div>

              {/* ========================================
                  APPLY BUTTON
              ======================================== */}

              <div className="shrink-0 lg:pt-1">

                {applied ? (
                  <div className="min-w-[190px] rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-6 py-4 text-center">

                    <div className="flex items-center justify-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-sm text-emerald-300">
                        ✓
                      </span>

                      <span className="font-semibold text-emerald-300">
                        Applied
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-emerald-400/60">
                      Application submitted
                    </p>

                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applying}
                    className="group relative min-w-[190px] overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-7 py-4 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <span className="relative z-10 flex items-center justify-center gap-2">

                      {applying
                        ? "Applying..."
                        : "Apply Now"}

                      {!applying && (
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      )}

                    </span>

                  </button>
                )}

              </div>

            </div>

            {/* Application error */}

            {applicationError && (
              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-300">

                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  !
                </span>

                <span>
                  {applicationError}
                </span>

              </div>
            )}

          </div>

          {/* ==========================================
              DESCRIPTION
          ========================================== */}

          <div className="border-t border-white/[0.08] px-6 py-8 sm:px-8 lg:px-10">

            <div className="max-w-4xl">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/10">
                  <span>✦</span>
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    About the Opportunity
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-600">
                    What you&apos;ll be working on
                  </p>
                </div>

              </div>

              <p className="whitespace-pre-wrap text-sm leading-8 text-gray-400 sm:text-base">
                {opportunity.description}
=======
              <h1 className="mt-4 text-3xl font-bold">
                {opportunity.title}
              </h1>

              <p className="mt-2 text-lg text-purple-600">
                {opportunity.company}
              </p>

              {opportunity.location && (
                <p className="mt-2 text-sm text-gray-500">
                  📍 {opportunity.location}
                </p>
              )}
            </div>

            {/* Readiness */}
            <div className="shrink-0 rounded-2xl border border-purple-200 bg-purple-50 p-6 text-center">
              <p className="text-4xl font-bold text-purple-700">
                {opportunity.readinessScore}%
>>>>>>> 3fe572762eeaea190ed8b00abd740321424a77e6
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Readiness
              </p>
            </div>
          </div>

<<<<<<< HEAD
          {/* ==========================================
              REQUIRED SKILLS
          ========================================== */}

          <div className="border-t border-white/[0.08] px-6 py-8 sm:px-8 lg:px-10">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/10 bg-purple-500/10">
                  <span>🧠</span>
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Required Skills
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Skills identified from the opportunity requirements.
                  </p>

                </div>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-gray-500">
                {opportunity.skills.length}{" "}
                {opportunity.skills.length === 1
                  ? "skill"
                  : "skills"}
              </div>

            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {opportunity.skills.map(
                (skill) => (
                  <div
                    key={skill.id}
                    className={`group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${
                      skill.required
                        ? "border-indigo-500/20 bg-indigo-500/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.09]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <span className="font-medium text-gray-200">
                            {skill.name}
                          </span>

                          {skill.required && (
                            <span className="text-indigo-400">
                              *
                            </span>
                          )}

                        </div>

                        {skill.category && (
                          <p className="mt-1 text-[11px] text-gray-600">
                            {skill.category}
                          </p>
                        )}

                      </div>

                      {skill.required && (
                        <span className="shrink-0 rounded-full border border-indigo-400/10 bg-indigo-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-indigo-300">
                          Required
                        </span>
                      )}

                    </div>

                    <div className="mt-4">

                      <div className="mb-2 flex items-center justify-between text-xs">

                        <span className="text-gray-600">
                          Minimum proficiency
                        </span>

                        <span className="font-semibold text-gray-400">
                          {skill.minimumProficiency}%
                        </span>

                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{
                            width: `${Math.min(
                              skill.minimumProficiency,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

            <p className="mt-5 text-xs text-gray-600">
              <span className="text-indigo-400">*</span>{" "}
              Required skill
            </p>

          </div>

          {/* ==========================================
              BOTTOM APPLY
          ========================================== */}

          <div className="border-t border-white/[0.08] bg-white/[0.015] px-6 py-9 sm:px-8 lg:px-10">

            <div className="flex flex-col items-center text-center">

              {applied ? (
                <>

                  <div className="flex items-center gap-2 text-lg font-semibold text-emerald-300">

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                      ✓
                    </span>

                    Application Submitted

                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Your application has been sent successfully.
                  </p>

                </>
              ) : (
                <>

                  <p className="mb-5 text-sm text-gray-500">
                    Think this opportunity matches your Skill DNA?
                  </p>

                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applying}
                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {applying
                      ? "Submitting Application..."
                      : "Apply Now"}

                    {!applying && (
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    )}

                  </button>

                </>
              )}

            </div>
=======
          <div className="mt-8 border-t pt-6">
            <p className="leading-7 text-gray-600">
              {opportunity.description}
            </p>
          </div>
        </section>

        {/* Explanation */}
        <section>
          <h2 className="text-2xl font-bold">
            Your Skill Match
          </h2>

          <p className="mt-1 text-gray-500">
            Your readiness is calculated by
            comparing your current Skill DNA
            against this opportunity&apos;s
            required proficiency levels and
            skill weights.
          </p>
        </section>

        {/* Summary */}
        <section className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Strong Skills
            </p>

            <p className="mt-2 text-4xl font-bold">
              {strongSkills.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Requirements you currently meet
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Moderate
            </p>

            <p className="mt-2 text-4xl font-bold">
              {moderateSkills.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Skills that need improvement
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Skill Gaps
            </p>
>>>>>>> 3fe572762eeaea190ed8b00abd740321424a77e6

            <p className="mt-2 text-4xl font-bold">
              {gapSkills.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Requirements currently below target
            </p>
          </div>

        </section>

<<<<<<< HEAD
        {/* ============================================
            FOOTER
        ============================================ */}

        <div className="py-7 text-center">

          <p className="text-xs text-gray-600">
            SkillSetu · Connect skills with opportunities.
          </p>

        </div>
=======
        {/* Strong Skills */}
        {strongSkills.length > 0 && (
          <SkillSection
            title="Strong Skills"
            description="You currently meet or exceed the required proficiency."
            skills={strongSkills}
          />
        )}

        {/* Moderate Skills */}
        {moderateSkills.length > 0 && (
          <SkillSection
            title="Skills to Strengthen"
            description="You have some capability here, but additional improvement would increase your readiness."
            skills={moderateSkills}
          />
        )}

        {/* Gaps */}
        {gapSkills.length > 0 && (
          <SkillSection
            title="Skill Gaps"
            description="These are the biggest differences between your current Skill DNA and this opportunity."
            skills={gapSkills}
          />
        )}
>>>>>>> 3fe572762eeaea190ed8b00abd740321424a77e6

      </div>
    </main>
  );
}

<<<<<<< HEAD
=======
function SkillSection({
  title,
  description,
  skills,
}: {
  title: string;
  description: string;
  skills: GapSkill[];
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div>
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="mt-6 space-y-5">

        {skills.map((skill) => (
          <div
            key={skill.skillId}
            className="rounded-xl border p-5"
          >

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>
                <h3 className="font-semibold">
                  {skill.skillName}
                </h3>

                {skill.category && (
                  <p className="mt-1 text-xs text-gray-500">
                    {skill.category}
                  </p>
                )}
              </div>

              <div className="text-sm">
                <span className="font-semibold">
                  {skill.studentProficiency}%
                </span>

                <span className="mx-2 text-gray-400">
                  /
                </span>

                <span className="text-gray-500">
                  {skill.requiredProficiency}%
                  required
                </span>
              </div>

            </div>

            {/* Progress */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-black"
                style={{
                  width: `${Math.min(
                    skill.studentProficiency,
                    100
                  )}%`,
                }}
              />

            </div>

            {/* Gap information */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs">

              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                Weight: {skill.weight}
              </span>

              {skill.required && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                  Required
                </span>
              )}

              {skill.gap > 0 && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
                  {skill.gap}% gap
                </span>
              )}

              {skill.gap === 0 && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-600">
                  Requirement met
                </span>
              )}

            </div>

          </div>
        ))}

      </div>
    </section>
  );
}
>>>>>>> 3fe572762eeaea190ed8b00abd740321424a77e6
