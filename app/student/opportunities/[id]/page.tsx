"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Skill = {
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
  skills: Skill[];
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const response = await fetch(
          `/api/student/opportunities/${params.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load opportunity."
          );
        }

        setOpportunity(data.opportunity);
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

    if (params.id) {
      loadOpportunity();
    }
  }, [params.id]);

  async function handleApply() {
    if (!opportunity) return;

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400">
            Loading opportunity...
          </p>
        </div>
      </main>
    );
  }

  if (error || !opportunity) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error || "Opportunity not found."}
          </div>

          <button
            onClick={() =>
              router.push("/student/opportunities")
            }
            className="mt-5 rounded-xl border border-white/10 px-5 py-3 text-sm hover:bg-white/5"
          >
            ← Back to Opportunities
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={() =>
            router.push("/student/opportunities")
          }
          className="mb-8 text-sm text-gray-400 hover:text-white transition"
        >
          ← Back to Opportunities
        </button>

        {/* Main card */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            <div>
              <span className="inline-block rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 mb-4">
                {opportunity.type.replaceAll(
                  "_",
                  " "
                )}
              </span>

              <h1 className="text-4xl font-bold">
                {opportunity.title}
              </h1>

              <p className="text-xl text-purple-300 mt-2">
                {opportunity.company}
              </p>

              {opportunity.location && (
                <p className="text-sm text-gray-500 mt-3">
                  📍 {opportunity.location}
                </p>
              )}
            </div>

          </div>

          {/* Description */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h2 className="text-xl font-semibold mb-4">
              About the Opportunity
            </h2>

            <p className="text-gray-400 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Skills */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h2 className="text-xl font-semibold mb-2">
              Required Skills
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Skills required for this opportunity.
            </p>

            <div className="space-y-3">
              {opportunity.skills.map(
                (skill) => (
                  <div
                    key={skill.id}
                    className="rounded-xl border border-white/10 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="font-medium">
                          {skill.name}
                        </p>

                        {skill.category && (
                          <p className="text-xs text-gray-500 mt-1">
                            {skill.category}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-purple-300">
                          {skill.minimumProficiency}%
                        </p>

                        <p className="text-xs text-gray-500">
                          Minimum
                        </p>
                      </div>

                    </div>

                    <div className="mt-3 flex items-center gap-3">

                      {skill.required ? (
                        <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300">
                          Required
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                          Preferred
                        </span>
                      )}

                      <span className="text-xs text-gray-500">
                        Weight: {skill.weight}
                      </span>

                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Apply */}
          <div className="mt-8 pt-8 border-t border-white/10">

            {applyError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {applyError}
              </div>
            )}

            <button
              type="button"
              onClick={handleApply}
              disabled={applied || applying}
              className={`w-full rounded-xl px-5 py-4 text-sm font-semibold transition ${
                applied
                  ? "bg-green-600/20 text-green-300 border border-green-500/20"
                  : "bg-purple-600 text-white hover:bg-purple-500"
              } disabled:cursor-not-allowed`}
            >
              {applying
                ? "Applying..."
                : applied
                ? "✓ Application Submitted"
                : "Apply Now"}
            </button>

          </div>
        </section>
      </div>
    </main>
  );
}