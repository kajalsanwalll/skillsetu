"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  industry: {
    name: string;
  };
  skills: OpportunitySkill[];
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationError, setApplicationError] =
    useState("");

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const response = await fetch(
          `/api/student/opportunities/${opportunityId}`
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

    if (opportunityId) {
      loadOpportunity();
    }
  }, [opportunityId]);

  async function handleApply() {
    setApplying(true);
    setApplicationError("");

    try {
      const response = await fetch(
        "/api/student/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opportunityId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setApplied(true);
          return;
        }

        throw new Error(
          data.error ||
            "Failed to submit application."
        );
      }

      setApplied(true);
    } catch (error) {
      setApplicationError(
        error instanceof Error
          ? error.message
          : "Failed to submit application."
      );
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error ||
              "Opportunity not found."}
          </div>

          <button
            onClick={() =>
              router.push(
                "/student/opportunities"
              )
            }
            className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            ← Back to Opportunities
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          onClick={() =>
            router.push(
              "/student/opportunities"
            )
          }
          className="mb-8 text-sm text-gray-400 hover:text-white transition"
        >
          ← Back to Opportunities
        </button>

        {/* Main Card */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3 mb-4">

                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                  {opportunity.type.replaceAll(
                    "_",
                    " "
                  )}
                </span>

                {opportunity.location && (
                  <span className="text-sm text-gray-500">
                    📍 {opportunity.location}
                  </span>
                )}

              </div>

              <h1 className="text-4xl font-bold">
                {opportunity.title}
              </h1>

              <p className="mt-2 text-lg text-purple-300">
                {opportunity.company}
              </p>

              {opportunity.industry?.name && (
                <p className="mt-1 text-sm text-gray-500">
                  Posted by{" "}
                  {opportunity.industry.name}
                </p>
              )}

            </div>

            {/* Apply */}
            <div className="shrink-0">

              {applied ? (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-3 text-center">
                  <p className="font-semibold text-green-300">
                    ✓ Applied
                  </p>
                  <p className="mt-1 text-xs text-green-400/70">
                    Application submitted
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="rounded-xl bg-purple-600 px-7 py-3 font-semibold text-white hover:bg-purple-500 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applying
                    ? "Applying..."
                    : "Apply Now"}
                </button>
              )}

            </div>

          </div>

          {/* Application Error */}
          {applicationError && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {applicationError}
            </div>
          )}

          {/* Description */}
          <div className="mt-10 border-t border-white/10 pt-8">

            <h2 className="text-xl font-semibold">
              About the Opportunity
            </h2>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-400">
              {opportunity.description}
            </p>

          </div>

          {/* Skills */}
          <div className="mt-10 border-t border-white/10 pt-8">

            <h2 className="text-xl font-semibold">
              Required Skills
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Skills identified from the
              opportunity requirements.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              {opportunity.skills.map(
                (skill) => (
                  <div
                    key={skill.id}
                    className={`rounded-xl border px-4 py-3 ${
                      skill.required
                        ? "border-purple-500/20 bg-purple-500/10"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-2">

                      <span className="font-medium">
                        {skill.name}
                      </span>

                      {skill.required && (
                        <span className="text-purple-400">
                          *
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Minimum proficiency:{" "}
                      {skill.minimumProficiency}%
                    </p>

                  </div>
                )
              )}

            </div>

            <p className="mt-4 text-xs text-gray-500">
              * Required skill
            </p>

          </div>

          {/* Bottom Apply */}
          <div className="mt-10 border-t border-white/10 pt-8 flex flex-col items-center">

            {applied ? (
              <>
                <div className="text-lg font-semibold text-green-300">
                  ✓ Application Submitted
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Your application has been sent
                  successfully.
                </p>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-500">
                  Think this opportunity matches
                  your Skill DNA?
                </p>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="rounded-xl bg-purple-600 px-8 py-3 font-semibold hover:bg-purple-500 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applying
                    ? "Submitting Application..."
                    : "Apply Now"}
                </button>
              </>
            )}

          </div>

        </section>
      </div>
    </main>
  );
}