"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string | null;
  createdAt: string;
  _count?: {
    applications: number;
  };
};

export default function IndustryPage() {
  const [opportunities, setOpportunities] = useState<
    Opportunity[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const response = await fetch(
          "/api/industry/opportunities"
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

  const totalApplications = opportunities.reduce(
    (total, opportunity) =>
      total +
      (opportunity._count?.applications ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <p className="text-sm text-[#F4A93B] mb-2">
              INDUSTRY
            </p>

            <h1 className="text-4xl font-bold">
              Industry Dashboard
            </h1>

            <p className="text-[#9AA3C0] mt-2">
              Create opportunities and find talent
              based on real-world skills.
            </p>
          </div>

          <Link
            href="/industry/opportunities/new"
            className="rounded-xl bg-[#F4A93B] px-5 py-3 font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition"
          >
            + Create Opportunity
          </Link>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-8 rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#f083a8]">
            {error}
          </div>
        )}

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-[#9AA3C0] text-sm">
              Opportunities
            </p>

            <p className="text-3xl font-bold mt-2">
              {loading ? "—" : opportunities.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-[#9AA3C0] text-sm">
              Applications
            </p>

            <p className="text-3xl font-bold mt-2">
              {loading ? "—" : totalApplications}
            </p>
          </div>

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-[#9AA3C0] text-sm">
              Talent Matches
            </p>

            <p className="text-3xl font-bold mt-2">
              {loading ? "—" : totalApplications}
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

          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#232B47] p-12 text-center">
              <p className="text-[#9AA3C0]">
                Loading opportunities...
              </p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#232B47] p-12 text-center">

              <div className="text-4xl mb-4">
                🏢
              </div>

              <h3 className="text-lg font-semibold mb-2">
                No opportunities yet
              </h3>

              <p className="text-[#9AA3C0] mb-6">
                Create your first opportunity and
                let SkillSetu extract the skills you need.
              </p>

              <Link
                href="/industry/opportunities/new"
                className="inline-block rounded-xl bg-[#F4A93B] px-6 py-3 font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition"
              >
                Create Opportunity
              </Link>

            </div>
          ) : (
            <div className="space-y-4">

              {opportunities.map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href={`/industry/opportunities/${opportunity.id}`}
                  className="block rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6 hover:border-[#F4A93B]/40 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div>
                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-semibold">
                          {opportunity.title}
                        </h3>

                        <span className="rounded-full border border-[#232B47] px-3 py-1 text-xs text-[#C7CCE0]">
                          {opportunity.type.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                      </div>

                      <p className="text-[#F4A93B] mt-2">
                        {opportunity.company}
                      </p>

                      {opportunity.location && (
                        <p className="text-sm text-[#9AA3C0] mt-2">
                          📍 {opportunity.location}
                        </p>
                      )}
                    </div>

                    <div className="text-right">

                      <p className="text-2xl font-bold text-[#F4A93B]">
                        {opportunity._count?.applications ?? 0}
                      </p>

                      <p className="text-xs text-[#9AA3C0]">
                        Applications
                      </p>

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