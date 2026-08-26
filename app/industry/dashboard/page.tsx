"use client";

import Link from "next/link";

export default function IndustryPage() {
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
              Create opportunities and find talent based on real-world skills.
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
              0
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-gray-400 text-sm">
              Applications
            </p>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-gray-400 text-sm">
              Talent Matches
            </p>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

        </div>

        {/* Opportunities */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">
              Your Opportunities
            </h2>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <div className="text-4xl mb-4">
              🏢
            </div>

            <h3 className="text-lg font-semibold mb-2">
              No opportunities yet
            </h3>

            <p className="text-gray-400 mb-6">
              Create your first opportunity and let SkillSetu
              extract the skills you need.
            </p>

            <Link
              href="/industry/opportunities/new"
              className="inline-block rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500 transition"
            >
              Create Opportunity
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}