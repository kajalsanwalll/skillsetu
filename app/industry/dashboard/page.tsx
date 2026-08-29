"use client";

import Link from "next/link";

export default function IndustryPage() {
  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-sm text-[#F4A93B] mb-2">
              INDUSTRY
            </p>

            <h1 className="text-4xl font-bold">
              Industry Dashboard
            </h1>

            <p className="text-[#9AA3C0] mt-2">
              Create opportunities and find talent based on real-world skills.
            </p>
          </div>

          <Link
            href="/industry/opportunities/new"
            className="rounded-xl bg-[#F4A93B] px-5 py-3 font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition"
          >
            + Create Opportunity
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-[#9AA3C0] text-sm">
              Opportunities
            </p>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-[#9AA3C0] text-sm">
              Applications
            </p>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-[#9AA3C0] text-sm">
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

          <div className="rounded-2xl border border-dashed border-[#232B47] p-12 text-center">
            <div className="text-4xl mb-4">
              🏢
            </div>

            <h3 className="text-lg font-semibold mb-2">
              No opportunities yet
            </h3>

            <p className="text-[#9AA3C0] mb-6">
              Create your first opportunity and let SkillSetu
              extract the skills you need.
            </p>

            <Link
              href="/industry/opportunities/new"
              className="inline-block rounded-xl bg-[#F4A93B] px-6 py-3 font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition"
            >
              Create Opportunity
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}