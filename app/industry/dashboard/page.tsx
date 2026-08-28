
"use client";

import Link from "next/link";

export default function IndustryPage() {
  return (
    <main className="min-h-screen bg-[#08080c] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Top bar */}
        <div className="mb-12 flex items-center justify-between">
          {/* Brand */}
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

          {/* Create button */}
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
            Build your{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-300 bg-clip-text text-transparent">
              talent pipeline.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
            Create opportunities and find talent based on
            real-world skills. SkillSetu helps you connect
            with students based on what they can actually do.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Opportunities */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-white/[0.05]">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-lg text-purple-300">
                  ◇
                </div>

                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
                  Total
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Opportunities
              </p>

              <p className="mt-1 text-4xl font-bold tracking-tight">
                0
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Roles currently created
              </p>
            </div>
          </div>

          {/* Applications */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-white/[0.05]">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-lg text-indigo-300">
                  ↗
                </div>

                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
                  Activity
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Applications
              </p>

              <p className="mt-1 text-4xl font-bold tracking-tight">
                0
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Candidate applications received
              </p>
            </div>
          </div>

          {/* Talent Matches */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.05]">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-lg text-violet-300">
                  ✦
                </div>

                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
                  Matching
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Talent Matches
              </p>

              <p className="mt-1 text-4xl font-bold tracking-tight">
                0
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Skill-matched candidates
              </p>
            </div>
          </div>
        </section>

        {/* Opportunities */}
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
                Manage your roles and discover the right talent.
              </p>
            </div>
          </div>

          {/* Empty state */}
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-20 text-center">
            {/* Glow */}
            <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[90px]" />

            <div className="relative mx-auto max-w-lg">
              {/* Icon */}
              <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 shadow-lg shadow-purple-900/10">
                <span className="text-3xl">🏢</span>
              </div>

              <div className="mb-2 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                Get started
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                No opportunities yet
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                Create your first opportunity and let SkillSetu
                extract the skills you need to find relevant
                candidates.
              </p>

              <Link
                href="/industry/opportunities/new"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-purple-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500"
              >
                <span className="text-lg leading-none">+</span>
                Create Opportunity
                <span className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              {/* Bottom hint */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400/70" />
                Define skills
                <span>•</span>
                Match talent
                <span>•</span>
                Build teams
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

