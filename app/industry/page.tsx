
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch("/api/industry/opportunities");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to fetch opportunities."
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

  const totalApplications = opportunities.reduce(
    (total, opportunity) =>
      total + opportunity.applications.length,
    0
  );

  const totalSkills = opportunities.reduce(
    (total, opportunity) =>
      total + opportunity.skills.length,
    0
  );

  return (
    <main className="min-h-screen bg-[#08080c] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Top navigation */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
              <span className="text-lg font-bold">S</span>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight">
                skillsetu
              </p>
              <p className="text-[11px] text-gray-500">
                Industry Portal
              </p>
            </div>
          </div>

          <Link
            href="/industry/opportunities/new"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-purple-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500"
          >
            <span className="text-lg leading-none">+</span>
            Create Opportunity
          </Link>
        </div>

        {/* Hero */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
              Industry Dashboard
            </p>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find the right{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-300 bg-clip-text text-transparent">
              talent.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
            Create opportunities, define the skills you need, and
            discover students whose Skill DNA matches your
            requirements.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Opportunities */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-white/[0.05]">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-lg">
                  ◇
                </div>

                <span className="text-xs text-gray-600">
                  TOTAL
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Opportunities
              </p>

              <p className="mt-1 text-4xl font-bold tracking-tight">
                {opportunities.length}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Active opportunities created
              </p>
            </div>
          </div>

          {/* Applications */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-white/[0.05]">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-lg">
                  ↗
                </div>

                <span className="text-xs text-gray-600">
                  TALENT
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Applications
              </p>

              <p className="mt-1 text-4xl font-bold tracking-tight">
                {totalApplications}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Students interested in roles
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.05]">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-lg">
                  ✦
                </div>

                <span className="text-xs text-gray-600">
                  DEMAND
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Skills Requested
              </p>

              <p className="mt-1 text-4xl font-bold tracking-tight">
                {totalSkills}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Skill requirements across roles
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5 text-sm text-red-300">
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Opportunities section */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
                Workspace
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Your Opportunities
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your roles and discover matched talent.
              </p>
            </div>

            {!loading && opportunities.length > 0 && (
              <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-400 sm:block">
                {opportunities.length}{" "}
                {opportunities.length === 1
                  ? "opportunity"
                  : "opportunities"}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-12">
              <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400/20 border-t-purple-400" />
                </div>

                <h3 className="font-semibold">
                  Loading opportunities
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Fetching your industry opportunities...
                </p>
              </div>
            </div>
          ) : opportunities.length === 0 ? (
            /* Empty state */
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-16 text-center">
              <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[80px]" />

              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-2xl">
                  🏢
                </div>

                <h3 className="text-xl font-semibold">
                  No opportunities yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Create your first opportunity and let SkillSetu
                  identify the skills required to find the right
                  candidates.
                </p>

                <Link
                  href="/industry/opportunities/new"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500"
                >
                  <span className="text-lg">+</span>
                  Create Opportunity
                </Link>
              </div>
            </div>
          ) : (
            /* Opportunity cards */
            <div className="grid gap-5">
              {opportunities.map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href={`/industry/opportunities/${opportunity.id}`}
                  className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/30 hover:bg-white/[0.045] hover:shadow-2xl hover:shadow-purple-950/20 sm:p-7"
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative">
                    {/* Card header */}
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        {/* Company icon */}
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-lg sm:flex">
                          {opportunity.company
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-purple-300">
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

                          <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-purple-300">
                            {opportunity.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-400">
                            {opportunity.company}
                          </p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-gray-500 transition-all group-hover:translate-x-1 group-hover:border-purple-500/20 group-hover:text-purple-300 sm:flex">
                        →
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-5 max-w-4xl text-sm leading-6 text-gray-500 line-clamp-2">
                      {opportunity.description}
                    </p>

                    {/* Skills */}
                    <div className="mt-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
                          Required skills
                        </span>

                        <div className="h-px flex-1 bg-white/[0.06]" />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {opportunity.skills
                          .slice(0, 6)
                          .map(({ skill }) => (
                            <span
                              key={skill.id}
                              className="rounded-lg border border-white/[0.06] bg-white/[0.035] px-3 py-1.5 text-xs text-gray-400 transition-colors group-hover:border-white/[0.1]"
                            >
                              {skill.name}
                            </span>
                          ))}

                        {opportunity.skills.length > 6 && (
                          <span className="px-2 py-1.5 text-xs text-gray-600">
                            +
                            {opportunity.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-5 text-xs text-gray-500">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        {opportunity.skills.length}{" "}
                        {opportunity.skills.length === 1
                          ? "skill"
                          : "skills"}
                      </span>

                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        {opportunity.applications.length}{" "}
                        {opportunity.applications.length === 1
                          ? "application"
                          : "applications"}
                      </span>

                      <span className="ml-auto hidden text-gray-600 sm:block">
                        View details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

