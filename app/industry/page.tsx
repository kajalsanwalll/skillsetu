"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OpportunitySkill = {
  id: string;
  required: boolean;
  weight: number;
  minimumProficiency: number;
  skill: {
    id: string;
    name: string;
    category: string | null;
  };
};

type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  type: string;
  createdAt: string;
  skills: OpportunitySkill[];
  applications: {
    id: string;
  }[];
};

export default function IndustryPage() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch(
          "/api/industry/opportunities"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to fetch opportunities."
          );
        }

        setOpportunities(data.opportunities);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch opportunities."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-sm text-purple-400 mb-2">
              INDUSTRY
            </p>

            <h1 className="text-4xl font-bold">
              Industry Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Create opportunities and discover
              skill-matched talent.
            </p>
          </div>

          <Link
            href="/industry/opportunities/new"
            className="rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 transition"
          >
            + Create Opportunity
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-gray-400 text-sm">
              Opportunities
            </p>

            <p className="text-3xl font-bold mt-2">
              {opportunities.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-gray-400 text-sm">
              Applications
            </p>

            <p className="text-3xl font-bold mt-2">
              {opportunities.reduce(
                (total, opportunity) =>
                  total +
                  opportunity.applications.length,
                0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-gray-400 text-sm">
              Skills Requested
            </p>

            <p className="text-3xl font-bold mt-2">
              {opportunities.reduce(
                (total, opportunity) =>
                  total + opportunity.skills.length,
                0
              )}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Opportunities */}
        <section>
          <h2 className="text-xl font-semibold mb-5">
            Your Opportunities
          </h2>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
              Loading opportunities...
            </div>
          ) : opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">

              <div className="text-4xl mb-4">
                🏢
              </div>

              <h3 className="text-lg font-semibold mb-2">
                No opportunities yet
              </h3>

              <p className="text-gray-400 mb-6">
                Create your first opportunity and let
                SkillSetu extract the required skills.
              </p>

              <Link
                href="/industry/opportunities/new"
                className="inline-block rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500"
              >
                Create Opportunity
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">

              {opportunities.map(
                (opportunity) => (
                  <Link
                    key={opportunity.id}
                    href={`/industry/opportunities/${opportunity.id}`}
                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-purple-500/40 hover:bg-white/[0.05] transition"
                  >
                    <div className="flex items-start justify-between gap-5">

                      <div>
                        <h3 className="text-xl font-semibold">
                          {opportunity.title}
                        </h3>

                        <p className="text-gray-400 mt-1">
                          {opportunity.company}
                          {opportunity.location
                            ? ` • ${opportunity.location}`
                            : ""}
                        </p>
                      </div>

                      <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                        {opportunity.type}
                      </span>

                    </div>

                    <p className="text-sm text-gray-400 mt-4 line-clamp-2">
                      {opportunity.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-5">
                      {opportunity.skills
                        .slice(0, 6)
                        .map(
                          ({ skill }) => (
                            <span
                              key={skill.id}
                              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-300"
                            >
                              {skill.name}
                            </span>
                          )
                        )}

                      {opportunity.skills.length >
                        6 && (
                        <span className="text-xs text-gray-500 py-1.5">
                          +
                          {opportunity.skills.length -
                            6}{" "}
                          more
                        </span>
                      )}
                    </div>

                    <div className="flex gap-5 mt-5 text-xs text-gray-500">
                      <span>
                        {opportunity.skills.length} skills
                      </span>

                      <span>
                        {opportunity.applications.length}{" "}
                        applications
                      </span>
                    </div>
                  </Link>
                )
              )}

            </div>
          )}
        </section>

      </div>
    </main>
  );
}