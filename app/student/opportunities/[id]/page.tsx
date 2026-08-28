"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type GapSkill = {
  skillId: string;
  skillName: string;
  category: string | null;
  studentProficiency: number;
  requiredProficiency: number;
  gap: number;
  weight: number;
  required: boolean;
  status:
    | "STRONG"
    | "MODERATE"
    | "GAP";
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

  readinessScore: number;

  strongSkills: number;
  moderateSkills: number;
  gapSkills: number;

  gapAnalysis: GapSkill[];
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const response = await fetch(
          `/api/student/opportunities/${id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load opportunity."
          );
        }

        setOpportunity(
          data.opportunity
        );
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

    if (id) {
      loadOpportunity();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-500">
            Analyzing your Skill DNA...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!opportunity) {
    return null;
  }

  const strongSkills =
    opportunity.gapAnalysis.filter(
      (skill) =>
        skill.status === "STRONG"
    );

  const moderateSkills =
    opportunity.gapAnalysis.filter(
      (skill) =>
        skill.status === "MODERATE"
    );

  const gapSkills =
    opportunity.gapAnalysis.filter(
      (skill) =>
        skill.status === "GAP"
    );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/student/opportunities"
            )
          }
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to opportunities
        </button>

        {/* Header */}
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                {opportunity.type.replaceAll(
                  "_",
                  " "
                )}
              </span>

              <h1 className="mt-4 text-3xl font-bold">
                {opportunity.title}
              </h1>

              <p className="mt-2 text-lg text-purple-600">
                {opportunity.company}
              </p>

              {opportunity.location && (
                <p className="mt-2 text-sm text-gray-500">
                  📍 {opportunity.location}
                </p>
              )}
            </div>

            {/* Readiness */}
            <div className="shrink-0 rounded-2xl border border-purple-200 bg-purple-50 p-6 text-center">
              <p className="text-4xl font-bold text-purple-700">
                {opportunity.readinessScore}%
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Readiness
              </p>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <p className="leading-7 text-gray-600">
              {opportunity.description}
            </p>
          </div>
        </section>

        {/* Explanation */}
        <section>
          <h2 className="text-2xl font-bold">
            Your Skill Match
          </h2>

          <p className="mt-1 text-gray-500">
            Your readiness is calculated by
            comparing your current Skill DNA
            against this opportunity&apos;s
            required proficiency levels and
            skill weights.
          </p>
        </section>

        {/* Summary */}
        <section className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Strong Skills
            </p>

            <p className="mt-2 text-4xl font-bold">
              {strongSkills.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Requirements you currently meet
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Moderate
            </p>

            <p className="mt-2 text-4xl font-bold">
              {moderateSkills.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Skills that need improvement
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Skill Gaps
            </p>

            <p className="mt-2 text-4xl font-bold">
              {gapSkills.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Requirements currently below target
            </p>
          </div>

        </section>

        {/* Strong Skills */}
        {strongSkills.length > 0 && (
          <SkillSection
            title="Strong Skills"
            description="You currently meet or exceed the required proficiency."
            skills={strongSkills}
          />
        )}

        {/* Moderate Skills */}
        {moderateSkills.length > 0 && (
          <SkillSection
            title="Skills to Strengthen"
            description="You have some capability here, but additional improvement would increase your readiness."
            skills={moderateSkills}
          />
        )}

        {/* Gaps */}
        {gapSkills.length > 0 && (
          <SkillSection
            title="Skill Gaps"
            description="These are the biggest differences between your current Skill DNA and this opportunity."
            skills={gapSkills}
          />
        )}

      </div>
    </main>
  );
}

function SkillSection({
  title,
  description,
  skills,
}: {
  title: string;
  description: string;
  skills: GapSkill[];
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div>
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="mt-6 space-y-5">

        {skills.map((skill) => (
          <div
            key={skill.skillId}
            className="rounded-xl border p-5"
          >

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>
                <h3 className="font-semibold">
                  {skill.skillName}
                </h3>

                {skill.category && (
                  <p className="mt-1 text-xs text-gray-500">
                    {skill.category}
                  </p>
                )}
              </div>

              <div className="text-sm">
                <span className="font-semibold">
                  {skill.studentProficiency}%
                </span>

                <span className="mx-2 text-gray-400">
                  /
                </span>

                <span className="text-gray-500">
                  {skill.requiredProficiency}%
                  required
                </span>
              </div>

            </div>

            {/* Progress */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-black"
                style={{
                  width: `${Math.min(
                    skill.studentProficiency,
                    100
                  )}%`,
                }}
              />

            </div>

            {/* Gap information */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs">

              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                Weight: {skill.weight}
              </span>

              {skill.required && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                  Required
                </span>
              )}

              {skill.gap > 0 && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
                  {skill.gap}% gap
                </span>
              )}

              {skill.gap === 0 && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-600">
                  Requirement met
                </span>
              )}

            </div>

          </div>
        ))}

      </div>
    </section>
  );
}