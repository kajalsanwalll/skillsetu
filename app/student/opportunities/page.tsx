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

const TEAL = "#2BA792";
const MARIGOLD = "#F4A93B";
const ROSE = "#E8598B";

function matchScoreColor(score: number) {
  if (score >= 75) return TEAL;
  if (score >= 50) return MARIGOLD;
  return ROSE;
}

export default function StudentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<
    Opportunity[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState<
  Set<string>
  >(new Set());

  useEffect(() => {
  async function loadOpportunities() {
    try {
      const [opportunitiesResponse, applicationsResponse] =
        await Promise.all([
          fetch("/api/student/opportunities"),
          fetch("/api/student/applications"),
        ]);

      const opportunitiesData =
        await opportunitiesResponse.json();

      const applicationsData =
        await applicationsResponse.json();

      if (!opportunitiesResponse.ok) {
        throw new Error(
          opportunitiesData.error ||
            "Failed to load opportunities."
        );
      }

      if (!applicationsResponse.ok) {
        throw new Error(
          applicationsData.error ||
            "Failed to load applications."
        );
      }

      setOpportunities(
        opportunitiesData.opportunities || []
      );

      const appliedIds = new Set<string>(
        (applicationsData.applications || []).map(
          (application: {
            opportunity: {
              id: string;
            };
          }) => application.opportunity.id
        )
      );

      setAppliedOpportunityIds(appliedIds);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#9AA3C0]">
            Finding opportunities that match your
            Skill DNA...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#f083a8]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <section className="mb-10">
          <p className="text-sm text-[#F4A93B] mb-2">
            OPPORTUNITY DISCOVERY
          </p>

          <h1 className="text-4xl font-bold">
            Find Your Opportunities
          </h1>

          <p className="text-[#9AA3C0] mt-2 max-w-2xl">
            SkillSetu matches your verified skills
            against real opportunity requirements.
          </p>
        </section>

        {/* Empty state */}
        {opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#232B47] p-12 text-center">
            <h2 className="text-xl font-semibold">
              No opportunities available yet
            </h2>

            <p className="text-[#9AA3C0] mt-2">
              Check back soon as industry partners
              add new opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {opportunities.map(
              (opportunity) => (
                <OpportunityCard
                 key={opportunity.id}
                 opportunity={opportunity}
                 initiallyApplied={appliedOpportunityIds.has(
                 opportunity.id
                 )}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function OpportunityCard({
  opportunity,
  initiallyApplied,
}: {
  opportunity: Opportunity;
  initiallyApplied: boolean;
}) {
  const matchScore = Math.round(
    opportunity.matchScore
  );

  const scoreColor = matchScoreColor(matchScore);

  const router = useRouter();

  const [applied, setApplied] =
  useState(initiallyApplied);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

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
        // If the API says the student already applied,
        // keep the UI in the Applied state.
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

  return (
    <article className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6 hover:border-[#F4A93B]/30 transition">

      {/* Main information */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">

            <span className="rounded-full border border-[#232B47] px-3 py-1 text-xs font-medium text-[#C7CCE0]">
              {opportunity.type.replaceAll(
                "_",
                " "
              )}
            </span>

            {opportunity.location && (
              <span className="text-xs text-[#9AA3C0]">
                📍 {opportunity.location}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-semibold">
            {opportunity.title}
          </h2>

          <p className="text-[#F4A93B] mt-1">
            {opportunity.company}
          </p>

          <p className="text-[#9AA3C0] mt-4 leading-relaxed">
            {opportunity.description}
          </p>
        </div>

        {/* Match score */}
        <div className="shrink-0 md:w-32 text-center">
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: `${scoreColor}33`,
              backgroundColor: `${scoreColor}1A`,
            }}
          >

            <p className="text-3xl font-bold" style={{ color: scoreColor }}>
              {matchScore}%
            </p>

            <p className="text-xs text-[#9AA3C0] mt-1">
              Skill Match
            </p>

          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-6 pt-5 border-t border-[#232B47]">

        <p className="text-sm font-medium text-[#C7CCE0] mb-3">
          Required Skills
        </p>

        <div className="flex flex-wrap gap-2">

          {opportunity.skills.map(
            (skill) => (
              <div
                key={skill.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  skill.required
                    ? "border-[#F4A93B]/30 bg-[#F4A93B]/10 text-[#f6d09a]"
                    : "border-[#232B47] bg-white/[0.02] text-[#C7CCE0]"
                }`}
              >
                {skill.name}

                <span className="ml-2 text-xs text-[#9AA3C0]">
                  {skill.minimumProficiency}%
                </span>

                {skill.required && (
                  <span className="ml-1 text-[#F4A93B]">
                    *
                  </span>
                )}
              </div>
            )
          )}

        </div>

        <p className="text-xs text-[#9AA3C0] mt-3">
          * Required skill
        </p>
      </div>

      {/* Apply error */}
      {applyError && (
        <div className="mt-4 rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-3 text-sm text-[#f083a8]">
          {applyError}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">

        {/* Existing button */}
        <button
          type="button"
          onClick={() =>
            router.push(
              `/student/opportunities/${opportunity.id}`
            )
          }
          className="rounded-xl border border-[#232B47] px-5 py-3 text-sm font-semibold text-[#C7CCE0] hover:bg-white/5 transition"
        >
          View Opportunity
        </button>

        {/* Apply button */}
        <button
          type="button"
          onClick={handleApply}
          disabled={applied || applying}
          className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
            applied
              ? "bg-[#2BA792]/15 text-[#6fd6c4] border border-[#2BA792]/30"
              : "bg-[#F4A93B] text-[#0F1526] hover:bg-[#f6bd6a]"
          } disabled:cursor-not-allowed`}
        >
          {applying
            ? "Applying..."
            : applied
            ? "✓ Applied"
            : "Apply Now"}
        </button>

      </div>
    </article>
  );
}