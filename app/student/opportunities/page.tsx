"use client";

import { useEffect, useState } from "react";

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400">
            Finding opportunities that match your
            Skill DNA...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <section className="mb-10">
          <p className="text-sm text-purple-400 mb-2">
            OPPORTUNITY DISCOVERY
          </p>

          <h1 className="text-4xl font-bold">
            Find Your Opportunities
          </h1>

          <p className="text-gray-400 mt-2 max-w-2xl">
            SkillSetu matches your verified skills
            against real opportunity requirements.
          </p>
        </section>

        {/* Empty state */}
        {opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <h2 className="text-xl font-semibold">
              No opportunities available yet
            </h2>

            <p className="text-gray-500 mt-2">
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
}: {
  opportunity: Opportunity;
}) {
  const matchScore = Math.round(
    opportunity.matchScore
  );

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-purple-500/30 transition">

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

        {/* Main information */}
        <div className="flex-1">

          <div className="flex flex-wrap items-center gap-3 mb-3">

            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              {opportunity.type.replaceAll(
                "_",
                " "
              )}
            </span>

            {opportunity.location && (
              <span className="text-xs text-gray-500">
                📍 {opportunity.location}
              </span>
            )}

          </div>

          <h2 className="text-2xl font-semibold">
            {opportunity.title}
          </h2>

          <p className="text-purple-300 mt-1">
            {opportunity.company}
          </p>

          <p className="text-gray-400 mt-4 leading-relaxed">
            {opportunity.description}
          </p>

        </div>

        {/* Match score */}
        <div className="shrink-0 md:w-32 text-center">

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">

            <p className="text-3xl font-bold text-purple-300">
              {matchScore}%
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Skill Match
            </p>

          </div>

        </div>

      </div>

      {/* Skills */}
      <div className="mt-6 pt-5 border-t border-white/10">

        <p className="text-sm font-medium text-gray-300 mb-3">
          Required Skills
        </p>

        <div className="flex flex-wrap gap-2">

          {opportunity.skills.map(
            (skill) => (
              <div
                key={skill.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  skill.required
                    ? "border-purple-500/20 bg-purple-500/10 text-purple-200"
                    : "border-white/10 bg-white/[0.03] text-gray-300"
                }`}
              >
                {skill.name}

                <span className="ml-2 text-xs text-gray-500">
                  {skill.minimumProficiency}%
                </span>

                {skill.required && (
                  <span className="ml-1 text-purple-400">
                    *
                  </span>
                )}
              </div>
            )
          )}

        </div>

        <p className="text-xs text-gray-500 mt-3">
          * Required skill
        </p>

      </div>

      {/* Action */}
      <div className="mt-6 flex justify-end">

        <button
          type="button"
          className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500 transition"
        >
          View Opportunity
        </button>

      </div>

    </article>
  );
}