"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type CompetencyLevel =
  | "EXPOSURE"
  | "FOUNDATIONAL"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

type RoadmapStep = {
  title: string;
  description: string;
  resourceUrl?: string | null;
  estimatedHours?: number | null;
};

type RoadmapSkill = {
  skillId: string;
  skillName: string;
  category?: string | null;

  currentLevel: CompetencyLevel;
  targetLevel: CompetencyLevel;

  currentProficiency: number;
  requiredProficiency: number;

  gap: number;

  required: boolean;
  weight: number;
  status: string;

  order: number;

  steps: RoadmapStep[];
};

type RoadmapOpportunity = {
  id: string;
  title: string;
  company: string;
  type: string;
  location?: string | null;
  industry?: string;
};

type GeneratedRoadmap = {
  opportunity: RoadmapOpportunity;

  readinessScore: number;

  strongSkills: number;
  moderateSkills: number;
  gapSkills: number;
  totalSkills: number;

  roadmapSkills: RoadmapSkill[];

  totalRoadmapSkills: number;
  totalEstimatedHours: number;

  isReady: boolean;
  message: string;
};

const TEAL = "#2BA792";
const MARIGOLD = "#F4A93B";
const ROSE = "#E8598B";

function formatLevel(level: CompetencyLevel) {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

function levelValue(level: CompetencyLevel) {
  const values: Record<CompetencyLevel, number> = {
    EXPOSURE: 1,
    FOUNDATIONAL: 2,
    INTERMEDIATE: 3,
    ADVANCED: 4,
    EXPERT: 5,
  };

  return values[level];
}

function levelColor(level: CompetencyLevel) {
  switch (level) {
    case "EXPERT":
      return TEAL;

    case "ADVANCED":
      return "#57C7B5";

    case "INTERMEDIATE":
      return MARIGOLD;

    case "FOUNDATIONAL":
      return "#E8B86D";

    case "EXPOSURE":
      return ROSE;

    default:
      return "#9AA3C0";
  }
}

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const opportunityId = searchParams.get("opportunityId");

  const [roadmap, setRoadmap] =
    useState<GeneratedRoadmap | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function generateRoadmap() {
      if (!opportunityId) {
        setError("No opportunity was selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/student/roadmap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opportunityId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to generate roadmap."
          );
        }

        if (!data.roadmap) {
          throw new Error(
            "The roadmap response was empty."
          );
        }

        setRoadmap(data.roadmap);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate roadmap."
        );
      } finally {
        setLoading(false);
      }
    }

    generateRoadmap();
  }, [opportunityId]);

  const progress = useMemo(() => {
    if (!roadmap) {
      return {
        completed: 0,
        total: 0,
        percentage: 0,
      };
    }

    // Your current API generates steps but does not persist
    // completion state yet.
    //
    // Therefore the initial generated roadmap starts at 0%.
    const allSteps = roadmap.roadmapSkills.flatMap(
      (skill) => skill.steps
    );

    const total = allSteps.length;

    return {
      completed: 0,
      total,
      percentage: 0,
    };
  }, [roadmap]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-8">
            <p className="text-sm font-medium text-[#F4A93B]">
              BUILDING YOUR ROADMAP
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              Analyzing your skill gaps...
            </h1>

            <p className="mt-2 text-sm text-[#9AA3C0]">
              We&apos;re comparing your trusted Skill DNA
              against the requirements of this opportunity.
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-1/2 animate-pulse rounded-full"
                style={{
                  backgroundColor: MARIGOLD,
                }}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-5xl space-y-6">
          <button
            type="button"
            onClick={() => router.push("/student/gaps")}
            className="text-sm text-[#9AA3C0] transition hover:text-[#C7CCE0]"
          >
            ← Back to skill gaps
          </button>

          <div className="rounded-2xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-6">
            <p className="font-semibold text-[#f083a8]">
              Could not generate roadmap
            </p>

            <p className="mt-2 text-sm text-[#f083a8]/80">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!roadmap) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#9AA3C0]">
            No roadmap found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/student/gaps")}
          className="text-sm text-[#9AA3C0] transition hover:text-[#C7CCE0]"
        >
          ← Back to skill gaps
        </button>

        {/* Header */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <span className="rounded-full border border-[#232B47] px-3 py-1 text-xs font-medium text-[#C7CCE0]">
                {roadmap.opportunity.type.replaceAll("_", " ")}
              </span>

              <h1 className="mt-4 text-3xl font-bold">
                Your Learning Roadmap
              </h1>

              <p className="mt-2 text-lg text-[#F4A93B]">
                {roadmap.opportunity.title}
              </p>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                {roadmap.opportunity.company}
              </p>

              {roadmap.opportunity.location && (
                <p className="mt-2 text-sm text-[#9AA3C0]">
                  📍 {roadmap.opportunity.location}
                </p>
              )}
            </div>

            {/* Readiness */}
            <div className="shrink-0 rounded-2xl border border-[#F4A93B]/30 bg-[#F4A93B]/10 p-6 text-center">
              <p
                className="text-4xl font-bold"
                style={{ color: MARIGOLD }}
              >
                {Math.round(roadmap.readinessScore)}%
              </p>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Readiness
              </p>

              <p className="mt-2 text-xs text-[#C7CCE0]">
                {roadmap.totalSkills} skills analyzed
              </p>
            </div>
          </div>

          {/* Readiness bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9AA3C0]">
                Opportunity readiness
              </span>

              <span className="text-[#C7CCE0]">
                {Math.round(roadmap.readinessScore)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, roadmap.readinessScore)
                  )}%`,
                  backgroundColor: MARIGOLD,
                }}
              />
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            value={roadmap.strongSkills}
            label="Strong skills"
            color={TEAL}
          />

          <SummaryCard
            value={roadmap.moderateSkills}
            label="Skills to improve"
            color={MARIGOLD}
          />

          <SummaryCard
            value={roadmap.gapSkills}
            label="Skill gaps"
            color={ROSE}
          />

          <SummaryCard
            value={`${roadmap.totalEstimatedHours}h`}
            label="Estimated learning"
            color="#C7CCE0"
          />
        </section>

        {/* Intro */}
        <section>
          <h2 className="text-2xl font-bold">
            Close Your Skill Gaps
          </h2>

          <p className="mt-2 max-w-3xl leading-7 text-[#9AA3C0]">
            {roadmap.message}
          </p>
        </section>

        {/* Ready */}
        {roadmap.isReady ? (
          <section className="rounded-2xl border border-[#2BA792]/30 bg-[#2BA792]/10 p-8">
            <p className="text-lg font-semibold text-[#6fd6c4]">
              🎉 You&apos;re ready for this opportunity
            </p>

            <p className="mt-2 text-sm text-[#9AA3C0]">
              Your current trusted Skill DNA meets the
              recorded competency requirements.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/student/opportunities/${roadmap.opportunity.id}`
                )
              }
              className="mt-5 rounded-xl bg-[#F4A93B] px-5 py-3 text-sm font-semibold text-[#0F1526]"
            >
              View Opportunity
            </button>
          </section>
        ) : (
          <>
            {/* Roadmap */}
            <section className="space-y-6">
              {roadmap.roadmapSkills
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((roadmapSkill, index) => (
                  <RoadmapSkillCard
                    key={roadmapSkill.skillId}
                    roadmapSkill={roadmapSkill}
                    index={index}
                  />
                ))}
            </section>

            {/* Empty fallback */}
            {roadmap.roadmapSkills.length === 0 && (
              <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-8 text-center">
                <h2 className="text-xl font-semibold">
                  No skill gaps found
                </h2>

                <p className="mt-2 text-sm text-[#9AA3C0]">
                  You already appear to meet the required
                  skills for this opportunity.
                </p>
              </section>
            )}
          </>
        )}

        {/* Progress */}
        {!roadmap.isReady && (
          <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">
                  Roadmap progress
                </h2>

                <p className="mt-1 text-sm text-[#9AA3C0]">
                  {progress.total} learning steps generated
                  across {roadmap.totalRoadmapSkills} skills.
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-2xl font-bold"
                  style={{ color: TEAL }}
                >
                  {progress.percentage}%
                </p>

                <p className="text-xs text-[#9AA3C0]">
                  completed
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress.percentage}%`,
                  backgroundColor: TEAL,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-[#5B6488]">
              Progress tracking will become active once
              roadmap steps are persisted.
            </p>
          </section>
        )}

        {/* Bottom */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">
                Want to check your opportunity?
              </h2>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Return to the opportunity to see your full
                requirements and application details.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/student/opportunities/${roadmap.opportunity.id}`
                )
              }
              className="rounded-xl bg-[#F4A93B] px-5 py-3 text-sm font-semibold text-[#0F1526] transition hover:bg-[#f6bd6a]"
            >
              View Opportunity
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-5">
      <p
        className="text-2xl font-bold"
        style={{ color }}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-[#9AA3C0]">
        {label}
      </p>
    </div>
  );
}

function RoadmapSkillCard({
  roadmapSkill,
  index,
}: {
  roadmapSkill: RoadmapSkill;
  index: number;
}) {
  const [open, setOpen] = useState(true);

  const currentValue = levelValue(
    roadmapSkill.currentLevel
  );

  const targetValue = levelValue(
    roadmapSkill.targetLevel
  );

  const gapLevels = Math.max(
    targetValue - currentValue,
    0
  );

  return (
    <article className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
      {/* Skill header */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="w-full text-left"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4A93B]/10 text-sm font-bold text-[#F4A93B]">
              {index + 1}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold">
                  {roadmapSkill.skillName}
                </h3>

                {roadmapSkill.category && (
                  <span className="rounded-full border border-[#232B47] px-2 py-1 text-[10px] uppercase tracking-wide text-[#9AA3C0]">
                    {roadmapSkill.category}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-[#9AA3C0]">
                {roadmapSkill.required
                  ? "Required skill"
                  : "Preferred skill"}
                {" · "}
                Weight {roadmapSkill.weight}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[#9AA3C0]">
                Current → Target
              </p>

              <div className="mt-1 flex items-center gap-2">
                <LevelBadge
                  level={roadmapSkill.currentLevel}
                />

                <span className="text-[#5B6488]">
                  →
                </span>

                <LevelBadge
                  level={roadmapSkill.targetLevel}
                />
              </div>
            </div>

            <span className="text-[#9AA3C0]">
              {open ? "−" : "+"}
            </span>
          </div>
        </div>
      </button>

      {/* Proficiency */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#9AA3C0]">
            Current proficiency
          </span>

          <span className="text-[#C7CCE0]">
            {Math.round(
              roadmapSkill.currentProficiency
            )}
            % / {roadmapSkill.requiredProficiency}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  roadmapSkill.currentProficiency
                )
              )}%`,
              backgroundColor: ROSE,
            }}
          />
        </div>
      </div>

      {/* Gap */}
      {gapLevels > 0 && (
        <div className="mt-5 rounded-xl border border-[#E8598B]/20 bg-[#E8598B]/5 px-4 py-3">
          <p className="text-xs text-[#f083a8]">
            Skill gap
          </p>

          <p className="mt-1 text-sm text-[#C7CCE0]">
            Build from{" "}
            <span className="font-semibold">
              {formatLevel(
                roadmapSkill.currentLevel
              )}
            </span>{" "}
            toward{" "}
            <span className="font-semibold">
              {formatLevel(
                roadmapSkill.targetLevel
              )}
            </span>
            .
          </p>
        </div>
      )}

      {/* Steps */}
      {open && (
        <div className="mt-6 space-y-4 border-t border-[#232B47] pt-6">
          <div className="mb-4">
            <p className="text-sm font-semibold text-[#C7CCE0]">
              Learning steps
            </p>

            <p className="mt-1 text-xs text-[#9AA3C0]">
              Estimated time:{" "}
              {roadmapSkill.steps.reduce(
                (total, step) =>
                  total +
                  (step.estimatedHours ?? 0),
                0
              )}
              h
            </p>
          </div>

          {roadmapSkill.steps.length === 0 ? (
            <p className="text-sm text-[#9AA3C0]">
              No learning steps have been generated yet.
            </p>
          ) : (
            roadmapSkill.steps.map(
              (step, stepIndex) => (
                <RoadmapStepCard
                  key={`${roadmapSkill.skillId}-${stepIndex}`}
                  step={step}
                  stepIndex={stepIndex}
                />
              )
            )
          )}
        </div>
      )}
    </article>
  );
}

function RoadmapStepCard({
  step,
  stepIndex,
}: {
  step: RoadmapStep;
  stepIndex: number;
}) {
  return (
    <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/40 p-5">
      <div className="flex gap-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#5B6488] text-xs font-bold text-[#9AA3C0]">
          {stepIndex + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h4 className="font-semibold text-[#F5F1E8]">
                {step.title}
              </h4>

              <p className="mt-2 text-sm leading-6 text-[#9AA3C0]">
                {step.description}
              </p>
            </div>

            {step.estimatedHours != null && (
              <span className="shrink-0 rounded-full border border-[#232B47] px-3 py-1 text-xs text-[#9AA3C0]">
                ~{step.estimatedHours}h
              </span>
            )}
          </div>

          {step.resourceUrl && (
            <a
              href={step.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#F4A93B] hover:text-[#f6bd6a]"
            >
              Learn this skill →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function LevelBadge({
  level,
}: {
  level: CompetencyLevel;
}) {
  const color = levelColor(level);

  return (
    <span
      className="rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}12`,
      }}
    >
      {formatLevel(level)}
    </span>
  );
}