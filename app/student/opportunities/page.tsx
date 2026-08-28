
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type OpportunitySkill = {
  id: string;
  name: string;
  category: string | null;
  required: boolean;
  minimumProficiency: number;
  weight: number;
};

type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  type: string;
  createdAt: string;
  matchScore: number;
  skills: OpportunitySkill[];
};

export default function StudentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<
    Opportunity[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const response = await fetch(
          "/api/student/opportunities"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load opportunities."
          );
        }

        setOpportunities(
          data.opportunities || []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load opportunities."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, []);

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

        <BackgroundGlow />

        <div className="relative mx-auto max-w-6xl">

          {/* Header skeleton */}

          <div className="mb-10">

            <div className="mb-4 h-6 w-48 animate-pulse rounded-lg bg-white/[0.06]" />

            <div className="h-12 w-80 max-w-full animate-pulse rounded-xl bg-white/[0.06]" />

            <div className="mt-4 h-5 w-[500px] max-w-full animate-pulse rounded-lg bg-white/[0.04]" />

          </div>

          {/* Loading card */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8">

            <div className="flex flex-col items-center justify-center py-16 text-center">

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/10">

                <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-400" />

              </div>

              <h2 className="text-lg font-semibold">
                Finding opportunities
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Matching opportunities with your Skill DNA...
              </p>

            </div>

          </div>

        </div>
      </main>
    );
  }

  /* =============================================
     ERROR
  ============================================= */

  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

        <BackgroundGlow />

        <div className="relative mx-auto max-w-6xl">

          <div className="mb-10">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-500/[0.06] px-3 py-1.5 text-xs font-medium text-indigo-300">
              OPPORTUNITY DISCOVERY
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find Your Opportunities
            </h1>

          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-200">
                  Unable to load opportunities
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-red-300/70">
                  {error}
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

      <BackgroundGlow />

      <div className="relative mx-auto max-w-6xl">

        {/* ============================================
            HEADER
        ============================================ */}

        <section className="mb-10">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold shadow-lg shadow-indigo-500/20">
                S
              </div>

              <span className="text-lg font-semibold tracking-tight">
                SkillSetu
              </span>

            </div>

            <div className="hidden rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-gray-500 sm:block">
              Skill-powered discovery
            </div>

          </div>

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-500/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-300">

              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

              OPPORTUNITY DISCOVERY

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">

              Find Your{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Opportunities
              </span>

            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              SkillSetu matches your verified skills
              against real opportunity requirements.
            </p>

          </div>

          {/* Results summary */}

          <div className="mt-7 flex flex-wrap items-center gap-3">

            <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5">

              <span className="text-sm font-semibold text-white">
                {opportunities.length}
              </span>

              <span className="ml-2 text-xs text-gray-500">
                {opportunities.length === 1
                  ? "opportunity"
                  : "opportunities"}{" "}
                found
              </span>

            </div>

            <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/[0.04] px-4 py-2.5 text-xs text-indigo-300">
              Ranked by Skill Match
            </div>

          </div>

        </section>

        {/* ============================================
            EMPTY STATE
        ============================================ */}

        {opportunities.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 sm:p-16">

            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-500/[0.06] blur-3xl" />

            <div className="relative mx-auto max-w-lg text-center">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                ✦
              </div>

              <h2 className="text-xl font-semibold">
                No opportunities available yet
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Check back soon as industry partners
                add new opportunities.
              </p>

              <div className="mx-auto mt-7 h-px w-24 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            </div>

          </div>
        ) : (

          /* ==========================================
             OPPORTUNITY LIST
          ========================================== */

          <div className="space-y-5">

            {opportunities.map(
              (opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              )
            )}

          </div>

        )}

        {/* Footer */}

        <div className="py-8 text-center">

          <p className="text-xs text-gray-700">
            SkillSetu · Connect skills with opportunities.
          </p>

        </div>

      </div>
    </main>
  );
}

/* =================================================
   OPPORTUNITY CARD
================================================= */

function OpportunityCard({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const matchScore = Math.round(
    opportunity.matchScore
  );

  const router = useRouter();

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] =
    useState("");

  async function handleApply() {
    setApplying(true);
    setApplyError("");

    try {
      const response = await fetch(
        `/api/student/opportunities/${opportunity.id}/apply`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {

        /* If the API says the student already applied,
           keep the UI in the Applied state. */

        if (response.status === 409) {
          setApplied(true);
          return;
        }

        throw new Error(
          data.error || "Failed to apply."
        );
      }

      setApplied(true);

    } catch (error) {

      setApplyError(
        error instanceof Error
          ? error.message
          : "Failed to apply."
      );

    } finally {

      setApplying(false);

    }
  }

  /* Match score label */

  const matchLabel =
    matchScore >= 80
      ? "Excellent match"
      : matchScore >= 60
      ? "Good match"
      : matchScore >= 40
      ? "Potential match"
      : "Low match";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:bg-white/[0.035]">

      {/* Card glow */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-500/[0.06] blur-3xl transition-all duration-500 group-hover:bg-indigo-500/[0.10]" />

      <div className="relative p-6 sm:p-7">

        {/* ==========================================
            MAIN INFORMATION
        ========================================== */}

        <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">

          <div className="min-w-0 flex-1">

            {/* Badges */}

            <div className="mb-4 flex flex-wrap items-center gap-2">

              <span className="rounded-full border border-indigo-400/10 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
                {opportunity.type.replaceAll(
                  "_",
                  " "
                )}
              </span>

              {opportunity.location && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-gray-500">
                  <span>📍</span>
                  {opportunity.location}
                </span>
              )}

            </div>

            {/* Title */}

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {opportunity.title}
            </h2>

            {/* Company */}

            <div className="mt-2 flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-xs font-bold text-indigo-300">
                {opportunity.company
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <p className="font-medium text-indigo-300">
                {opportunity.company}
              </p>

            </div>

            {/* Description */}

            <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
              {opportunity.description}
            </p>

          </div>

          {/* ========================================
              MATCH SCORE
          ======================================== */}

          <div className="shrink-0 lg:w-40">

            <div className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.10] to-purple-500/[0.05] p-4">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300/70">
                  Skill Match
                </span>

                <span className="text-indigo-400">
                  ✦
                </span>

              </div>

              <div className="mt-2 flex items-end gap-1">

                <span className="text-4xl font-bold tracking-tight text-white">
                  {matchScore}
                </span>

                <span className="mb-1 text-lg font-semibold text-indigo-300">
                  %
                </span>

              </div>

              <p className="mt-1 text-[11px] text-gray-500">
                {matchLabel}
              </p>

              {/* Progress */}

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(matchScore, 0),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        {/* ==========================================
            SKILLS
        ========================================== */}

        <div className="mt-7 border-t border-white/[0.08] pt-6">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-200">
                Required Skills
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Minimum proficiency requirements
              </p>

            </div>

            <span className="rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-gray-500">
              {opportunity.skills.length}{" "}
              {opportunity.skills.length === 1
                ? "skill"
                : "skills"}
            </span>

          </div>

          <div className="flex flex-wrap gap-2.5">

            {opportunity.skills.map(
              (skill) => (

                <div
                  key={skill.id}
                  className={`group/skill rounded-xl border px-3.5 py-2.5 text-sm transition-all ${
                    skill.required
                      ? "border-indigo-500/20 bg-indigo-500/[0.07] text-indigo-200 hover:border-indigo-500/30 hover:bg-indigo-500/[0.10]"
                      : "border-white/10 bg-white/[0.025] text-gray-300 hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >

                  <span>
                    {skill.name}
                  </span>

                  <span className="ml-2 rounded-md bg-black/20 px-1.5 py-0.5 text-[10px] text-gray-500">
                    {skill.minimumProficiency}%
                  </span>

                  {skill.required && (
                    <span className="ml-1.5 text-indigo-400">
                      *
                    </span>
                  )}

                </div>

              )
            )}

          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-600">

            <span className="text-indigo-400">
              *
            </span>

            Required skill

          </div>

        </div>

        {/* ==========================================
            APPLY ERROR
        ========================================== */}

        {applyError && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3.5 text-sm text-red-300">

            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              !
            </span>

            <span>
              {applyError}
            </span>

          </div>
        )}

        {/* ==========================================
            ACTIONS
        ========================================== */}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          {/* View */}

          <button
            type="button"
            onClick={() =>
              router.push(
                `/student/opportunities/${opportunity.id}`
              )
            }
            className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-gray-300 transition-all hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
          >

            View Opportunity

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>

          </button>

          {/* Apply */}

          <button
            type="button"
            onClick={handleApply}
            disabled={applied || applying}
            className={`group flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
              applied
                ? "border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/15 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/25"
            } disabled:cursor-not-allowed`}
          >

            {applying
              ? "Applying..."
              : applied
              ? "✓ Applied"
              : "Apply Now"}

            {!applied && !applying && (
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            )}

          </button>

        </div>

      </div>

    </article>
  );
}

/* =================================================
   BACKGROUND
================================================= */

function BackgroundGlow() {
  return (
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
  );
}

