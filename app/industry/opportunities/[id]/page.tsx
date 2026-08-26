"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Skill = {
  id: string;
  name: string;
  category: string | null;
};

type OpportunitySkill = {
  id: string;
  required: boolean;
  weight: number;
  minimumProficiency: number;
  skill: Skill;
};

type Application = {
  id: string;
  matchScore: number | null;
  status: string;
  studentProfile: {
    user: {
      name: string;
      email: string;
    };
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
  applications: Application[];
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const response = await fetch(
          `/api/industry/opportunities/${id}`
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

    loadOpportunity();
  }, [id]);

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
          <button
            onClick={() => router.push("/industry")}
            className="text-gray-400 hover:text-white mb-6"
          >
            ← Back to Industry
          </button>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error || "Opportunity not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push("/industry")}
          className="text-sm text-gray-400 hover:text-white mb-8"
        >
          ← Back to Opportunities
        </button>

        {/* Header */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

            <div>
              <span className="inline-block rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300 mb-4">
                {opportunity.type}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold">
                {opportunity.title}
              </h1>

              <p className="text-gray-400 mt-2">
                {opportunity.company}
                {opportunity.location
                  ? ` • ${opportunity.location}`
                  : ""}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 px-5 py-4 text-center">
              <p className="text-xs text-gray-500">
                Applications
              </p>

              <p className="text-2xl font-bold mt-1">
                {opportunity.applications.length}
              </p>
            </div>

          </div>

        </section>

        {/* Description */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Description
          </h2>

          <p className="text-gray-300 whitespace-pre-wrap leading-7">
            {opportunity.description}
          </p>

        </section>

        {/* Skills */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Required Skills
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Skills extracted and reviewed for this
              opportunity.
            </p>
          </div>

          <div className="space-y-4">

            {opportunity.skills.map(
              (opportunitySkill) => (
                <div
                  key={opportunitySkill.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h3 className="font-semibold">
                        {opportunitySkill.skill.name}
                      </h3>

                      {opportunitySkill.skill.category && (
                        <p className="text-xs text-gray-500 mt-1">
                          {opportunitySkill.skill.category}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">

                      {opportunitySkill.required ? (
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300">
                          Required
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-500/10 px-3 py-1 text-xs text-gray-400">
                          Optional
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">

                    <div>
                      <p className="text-xs text-gray-500">
                        Minimum proficiency
                      </p>

                      <p className="font-semibold mt-1">
                        {opportunitySkill.minimumProficiency}
                        %
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Weight
                      </p>

                      <p className="font-semibold mt-1">
                        {opportunitySkill.weight}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Category
                      </p>

                      <p className="font-semibold mt-1">
                        {opportunitySkill.skill.category ||
                          "General"}
                      </p>
                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </section>

        {/* Applications */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

          <h2 className="text-xl font-semibold mb-2">
            Applications
          </h2>

          <p className="text-sm text-gray-400 mb-6">
            Student applications will appear here once
            the matching and application system is live.
          </p>

          {opportunity.applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-gray-500">
                No applications yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunity.applications.map(
                (application) => (
                  <div
                    key={application.id}
                    className="rounded-xl border border-white/10 p-4"
                  >
                    <p className="font-medium">
                      {application.studentProfile.user.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {application.studentProfile.user.email}
                    </p>

                    {application.matchScore !== null && (
                      <p className="text-sm text-purple-300 mt-2">
                        Match:{" "}
                        {application.matchScore}%
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}