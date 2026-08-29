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

const TEAL = "#2BA792";
const MARIGOLD = "#F4A93B";
const ROSE = "#E8598B";

const statusColor: Record<GapSkill["status"], string> = {
  STRONG: TEAL,
  MODERATE: MARIGOLD,
  GAP: ROSE,
};

function readinessColor(score: number) {
  if (score >= 75) return TEAL;
  if (score >= 50) return MARIGOLD;
  return ROSE;
}

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

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");  

  useEffect(() => {
  async function loadOpportunity() {
    try {
      const response = await fetch(
        `/api/student/opportunities/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load opportunity."
        );
      }

      const loadedOpportunity = data.opportunity;

      setOpportunity(loadedOpportunity);

      // Check whether the student has already applied
      const applicationsResponse = await fetch(
        "/api/student/applications"
      );

      const applicationsData =
        await applicationsResponse.json();

      if (applicationsResponse.ok) {
        const alreadyApplied =
          applicationsData.applications?.some(
            (application: {
              opportunity: {
                id: string;
              };
            }) =>
              application.opportunity.id ===
              loadedOpportunity.id
          );

        setApplied(alreadyApplied);
      }
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

  async function handleApply() {
  if (!opportunity) return;

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
          opportunityId: opportunity.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to submit application."
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
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#9AA3C0]">
            Analyzing your Skill DNA...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#f083a8]">
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

  const readinessTint = readinessColor(opportunity.readinessScore);

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/student/opportunities"
            )
          }
          className="text-sm text-[#9AA3C0] hover:text-[#C7CCE0]"
        >
          ← Back to opportunities
        </button>

        {/* Header */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <span className="rounded-full border border-[#232B47] px-3 py-1 text-xs font-medium text-[#C7CCE0]">
                {opportunity.type.replaceAll(
                  "_",
                  " "
                )}
              </span>

              <h1 className="mt-4 text-3xl font-bold">
                {opportunity.title}
              </h1>

              <p className="mt-2 text-lg text-[#F4A93B]">
                {opportunity.company}
              </p>

              {opportunity.location && (
                <p className="mt-2 text-sm text-[#9AA3C0]">
                  📍 {opportunity.location}
                </p>
              )}
            </div>

            {/* Readiness */}
            <div className="shrink-0 flex flex-col gap-3">
              <div
                className="rounded-2xl border p-6 text-center"
                style={{
                  borderColor: `${readinessTint}40`,
                  backgroundColor: `${readinessTint}1A`,
                }}
              >
                <p className="text-4xl font-bold" style={{ color: readinessTint }}>
                  {opportunity.readinessScore}%
                </p>

                <p className="mt-1 text-sm text-[#9AA3C0]">
                  Readiness
                </p>
              </div>

              {applied ? (
                <div className="rounded-xl bg-[#2BA792]/15 border border-[#2BA792]/30 px-5 py-3 text-center text-sm font-semibold text-[#6fd6c4]">
                  ✓ Applied
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="rounded-xl bg-[#F4A93B] px-5 py-3 text-sm font-semibold text-[#0F1526] transition hover:bg-[#f6bd6a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-[#232B47] pt-6">
            <p className="leading-7 text-[#C7CCE0]">
              {opportunity.description}
            </p>
          </div>
        </section>

        {applicationError && (
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-4 text-sm text-[#f083a8]">
            {applicationError}
          </div>
        )}

        {/* Explanation */}
        <section>
          <h2 className="text-2xl font-bold">
            Your Skill Match
          </h2>

          <p className="mt-1 text-[#9AA3C0]">
            Your readiness is calculated by
            comparing your current Skill DNA
            against this opportunity&apos;s
            required proficiency levels and
            skill weights.
          </p>
        </section>

        {/* Summary — one distribution instead of three repeating cards */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
          <SegmentedBar
            label="Skill readiness breakdown"
            segments={[
              { label: "Strong", count: strongSkills.length, color: TEAL },
              { label: "Moderate", count: moderateSkills.length, color: MARIGOLD },
              { label: "Gap", count: gapSkills.length, color: ROSE },
            ]}
          />
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

function SegmentedBar({
  label,
  segments,
}: {
  label: string;
  segments: { label: string; count: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">{label}</p>

      <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-white/5">
        {total === 0 ? (
          <div className="h-full w-full bg-white/5" />
        ) : (
          segments.map((segment) => (
            <div
              key={segment.label}
              style={{
                width: `${(segment.count / total) * 100}%`,
                backgroundColor: segment.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ))
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <span key={segment.label} className="flex items-center gap-1.5 text-xs text-[#9AA3C0]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.label}: <span className="text-[#C7CCE0]">{segment.count}</span>
          </span>
        ))}
      </div>
    </div>
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
    <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

      <div>
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-[#9AA3C0]">
          {description}
        </p>
      </div>

      <div className="mt-6 space-y-5">

        {skills.map((skill) => {
          const tint = statusColor[skill.status];

          return (
            <div
              key={skill.skillId}
              className="rounded-xl border border-[#232B47] p-5"
            >

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <div>
                  <h3 className="font-semibold">
                    {skill.skillName}
                  </h3>

                  {skill.category && (
                    <p className="mt-1 text-xs text-[#9AA3C0]">
                      {skill.category}
                    </p>
                  )}
                </div>

                <div className="text-sm">
                  <span className="font-semibold" style={{ color: tint }}>
                    {skill.studentProficiency}%
                  </span>

                  <span className="mx-2 text-[#5B6488]">
                    /
                  </span>

                  <span className="text-[#9AA3C0]">
                    {skill.requiredProficiency}%
                    required
                  </span>
                </div>

              </div>

              {/* Progress — colored by status */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      skill.studentProficiency,
                      100
                    )}%`,
                    backgroundColor: tint,
                  }}
                />

              </div>

              {/* Gap information */}
              <div className="mt-3 flex flex-wrap gap-3 text-xs">

                <span className="rounded-full border border-[#232B47] px-3 py-1 text-[#9AA3C0]">
                  Weight: {skill.weight}
                </span>

                {skill.required && (
                  <span className="rounded-full border border-[#F4A93B]/30 bg-[#F4A93B]/10 px-3 py-1 text-[#f6d09a]">
                    Required
                  </span>
                )}

                {skill.gap > 0 && (
                  <span className="rounded-full border border-[#E8598B]/30 bg-[#E8598B]/10 px-3 py-1 text-[#f083a8]">
                    {skill.gap}% gap
                  </span>
                )}

                {skill.gap === 0 && (
                  <span className="rounded-full border border-[#2BA792]/30 bg-[#2BA792]/10 px-3 py-1 text-[#6fd6c4]">
                    Requirement met
                  </span>
                )}

              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}