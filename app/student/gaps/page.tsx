"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type SkillMatch = {
  id: string;
  name: string;
  category: string | null;
  required: boolean;
  weight: number;
  requiredLevel: string;
  studentLevel: string;
  trustedProficiency: number;
  claimedProficiency: number;
  meetsRequirement: boolean;
  evidenceCount: number;
  verifiedEvidenceCount: number;
  confidence: number;
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
  skills: SkillMatch[];
  matchScore: number;
  hasApplied: boolean;
};

const LEVELS: Record<string, number> = {
  EXPOSURE: 1,
  FOUNDATIONAL: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  EXPERT: 5,
};

const LEVEL_LABELS: Record<string, string> = {
  EXPOSURE: "Exposure",
  FOUNDATIONAL: "Foundational",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

function levelValue(level: string) {
  return LEVELS[level] ?? 0;
}

function levelLabel(level: string) {
  return LEVEL_LABELS[level] ?? level;
}

function isMissingSkill(skill: SkillMatch) {
  return (
    skill.trustedProficiency === 0 &&
    skill.evidenceCount === 0
  );
}

function gapSize(skill: SkillMatch) {
  return Math.max(
    0,
    levelValue(skill.requiredLevel) -
      levelValue(skill.studentLevel)
  );
}

export default function SkillGapsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const opportunityFromUrl =
    searchParams.get("opportunityId");

  const [opportunities, setOpportunities] = useState<
    Opportunity[]
  >([]);

  const [selectedOpportunityId, setSelectedOpportunityId] =
  useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * LOAD OPPORTUNITIES
   * ============================================================
   */

  useEffect(() => {
    async function loadOpportunities() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/student/opportunities"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load opportunities."
          );
        }

        setOpportunities(data.opportunities ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load opportunities."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, []);

  /*
   * ============================================================
   * RESTORE SELECTED OPPORTUNITY
   *
   * Priority:
   * 1. opportunityId from URL
   * 2. first available opportunity
   * ============================================================
   */

  const activeOpportunityId = useMemo(() => {
    if (
      opportunityFromUrl &&
      opportunities.some(
        (opportunity) =>
          opportunity.id === opportunityFromUrl
      )
    ) {
      return opportunityFromUrl;
    }

    if (
      selectedOpportunityId &&
      opportunities.some(
        (opportunity) =>
          opportunity.id === selectedOpportunityId
      )
    ) {
      return selectedOpportunityId;
    }

    return opportunities[0]?.id ?? null;
  }, [opportunities, opportunityFromUrl, selectedOpportunityId]);

  useEffect(() => {
    if (opportunities.length === 0) {
      return;
    }

    const urlHasValidOpportunity =
      opportunityFromUrl &&
      opportunities.some(
        (opportunity) =>
          opportunity.id === opportunityFromUrl
      );

    if (!urlHasValidOpportunity && !selectedOpportunityId) {
      const firstOpportunity =
        opportunities[0];

      router.replace(
        `/student/gaps?opportunityId=${encodeURIComponent(
          firstOpportunity.id
        )}`
      );
    }
  }, [
    opportunities,
    opportunityFromUrl,
    selectedOpportunityId,
    router,
  ]);

  /*
   * ============================================================
   * SELECTED OPPORTUNITY
   * ============================================================
   */

  const selectedOpportunity = useMemo(() => {
  if (!selectedOpportunityId) {
    return opportunities[0] ?? null;
  }

  return (
    opportunities.find(
      (opportunity) => opportunity.id === selectedOpportunityId
    ) ?? opportunities[0] ?? null
  );
}, [opportunities, selectedOpportunityId]);

  /*
   * ============================================================
   * HANDLE OPPORTUNITY CHANGE
   * ============================================================
   */

  function handleOpportunityChange(
    opportunityId: string
  ) {
    setSelectedOpportunityId(opportunityId);

    router.replace(
      `/student/gaps?opportunityId=${encodeURIComponent(
        opportunityId
      )}`
    );
  }

  /*
   * ============================================================
   * GAP ANALYSIS
   * ============================================================
   */

  const gapAnalysis = useMemo(() => {
    if (!selectedOpportunity) {
      return {
        matched: [],
        improvement: [],
        missing: [],
        allGaps: [],
        readiness: 0,
      };
    }

    const skills = selectedOpportunity.skills;

    const matched = skills
      .filter(
        (skill) => skill.meetsRequirement
      )
      .sort(
        (a, b) =>
          levelValue(b.studentLevel) -
          levelValue(a.studentLevel)
      );

    const improvement = skills
      .filter(
        (skill) =>
          !skill.meetsRequirement &&
          !isMissingSkill(skill)
      )
      .sort((a, b) => {
        const gapDifference =
          gapSize(b) - gapSize(a);

        if (gapDifference !== 0) {
          return gapDifference;
        }

        return b.weight - a.weight;
      });

    const missing = skills
      .filter(
        (skill) =>
          !skill.meetsRequirement &&
          isMissingSkill(skill)
      )
      .sort(
        (a, b) =>
          b.weight - a.weight
      );

    const allGaps = [
      ...missing,
      ...improvement,
    ];

    const requiredSkills =
      skills.filter(
        (skill) => skill.required
      );

    const readiness =
      requiredSkills.length > 0
        ? Math.round(
            (requiredSkills.filter(
              (skill) =>
                skill.meetsRequirement
            ).length /
              requiredSkills.length) *
              100
          )
        : 0;

    return {
      matched,
      improvement,
      missing,
      allGaps,
      readiness,
    };
  }, [selectedOpportunity]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-6xl">
          <p className="text-[#9AA3C0]">
            Analyzing your Skill DNA...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#f083a8]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * NO OPPORTUNITIES
   * ============================================================
   */

  if (opportunities.length === 0) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageHeader />

          <div className="rounded-2xl border border-dashed border-[#232B47] bg-[#171E33]/60 p-12 text-center">
            <p className="text-lg font-semibold">
              No opportunities available yet.
            </p>

            <p className="mt-2 text-sm text-[#9AA3C0]">
              Once opportunities are available,
              SkillSetu will analyze the skills you
              need to become a stronger match.
            </p>

            <Link
              href="/student/opportunities"
              className="mt-6 inline-block rounded-xl bg-[#F4A93B] px-5 py-3 text-sm font-semibold text-[#0F1526]"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalSkills =
    selectedOpportunity?.skills.length ?? 0;

  const requiredSkillCount =
    selectedOpportunity?.skills.filter(
      (skill) => skill.required
    ).length ?? 0;

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-6xl space-y-8">

        <PageHeader />

        {/* NAV */}

        <nav className="flex flex-wrap gap-2">
          {[
            {
              href: "/student/skill-dna",
              icon: "🧬",
              label: "Skill DNA",
            },
            {
              href: "/student/opportunities",
              icon: "🎯",
              label: "Opportunities",
            },
            {
              href: "/student/gaps",
              icon: "📈",
              label: "Skill Gaps",
            },
            {
              href: selectedOpportunity
                ? `/student/roadmap?opportunityId=${encodeURIComponent(
                    selectedOpportunity.id
                  )}`
                : "/student/roadmap",
              icon: "🗺️",
              label: "Roadmap",
            },
            {
              href: "/student/assessment",
              icon: "📝",
              label: "Assessments",
            },
            {
              href: "/student/portfolio",
              icon: "🗂️",
              label: "Portfolio",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                item.label === "Skill Gaps"
                  ? "border-[#F4A93B]/50 bg-[#F4A93B]/10 text-[#F4A93B]"
                  : "border-[#232B47] bg-[#171E33]/60 text-[#C7CCE0] hover:border-[#F4A93B]/40 hover:text-[#F5F1E8]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* OPPORTUNITY SELECTOR */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">

            <div>
              <p className="text-sm font-medium text-[#F4A93B]">
                TARGET OPPORTUNITY
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                What do you want to prepare for?
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-[#9AA3C0]">
                SkillSetu compares your trusted
                Skill DNA against the requirements
                of each opportunity and identifies
                the areas holding you back.
              </p>
            </div>

            <div className="w-full md:w-80">
              <label
                htmlFor="opportunity"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#9AA3C0]"
              >
                Opportunity
              </label>

              <select
                id="opportunity"
                value={
                  selectedOpportunityId ?? ""
                }
                onChange={(e) =>
                  handleOpportunityChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#232B47] bg-[#0F1526] px-4 py-3 text-sm text-[#F5F1E8] outline-none focus:border-[#F4A93B]"
              >
                {opportunities.map(
                  (opportunity) => (
                    <option
                      key={opportunity.id}
                      value={opportunity.id}
                    >
                      {opportunity.title} —{" "}
                      {opportunity.company}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>
        </section>

        {selectedOpportunity && (
          <>
            {/* OPPORTUNITY SUMMARY */}

            <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#F4A93B]">
                    {selectedOpportunity.type}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {selectedOpportunity.title}
                  </h2>

                  <p className="mt-1 text-[#C7CCE0]">
                    {selectedOpportunity.company}
                  </p>

                  {selectedOpportunity.location && (
                    <p className="mt-2 text-sm text-[#9AA3C0]">
                      📍{" "}
                      {selectedOpportunity.location}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <SummaryStat
                    value={`${gapAnalysis.readiness}%`}
                    label="Readiness"
                    color="#F4A93B"
                  />

                  <SummaryStat
                    value={
                      gapAnalysis.matched.length
                    }
                    label="Matched"
                    color="#2BA792"
                  />

                  <SummaryStat
                    value={
                      gapAnalysis.allGaps.length
                    }
                    label="Skill gaps"
                    color="#E8598B"
                  />
                </div>

              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#F4A93B] transition-all"
                  style={{
                    width: `${gapAnalysis.readiness}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-[#9AA3C0]">
                {requiredSkillCount} required
                skills · {totalSkills} total skills
                analyzed
              </p>
            </section>

            {/* GAPS */}

            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-bold">
                  Your Skill Gaps
                </h2>

                <p className="mt-1 text-sm text-[#9AA3C0]">
                  These are the skills where your
                  current capability does not yet
                  meet the opportunity requirement.
                </p>
              </div>

              {gapAnalysis.allGaps.length ===
              0 ? (
                <div className="rounded-2xl border border-[#2BA792]/30 bg-[#2BA792]/10 p-8 text-center">
                  <p className="text-lg font-semibold text-[#6fd6c4]">
                    🎉 No skill gaps detected.
                  </p>

                  <p className="mt-2 text-sm text-[#9AA3C0]">
                    Your current Skill DNA meets all
                    of the recorded requirements for
                    this opportunity.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gapAnalysis.allGaps.map(
                    (skill, index) => (
                      <SkillGapCard
                        key={skill.id}
                        skill={skill}
                        rank={index + 1}
                        opportunityId={
                          selectedOpportunity.id
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>

            {/* STRONG MATCHES */}

            <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
              <div>
                <h2 className="text-xl font-bold">
                  Skills You Already Match
                </h2>

                <p className="mt-1 text-sm text-[#9AA3C0]">
                  These skills currently meet or
                  exceed the required competency level.
                </p>
              </div>

              {gapAnalysis.matched.length ===
              0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-[#232B47] p-6 text-center">
                  <p className="text-sm text-[#9AA3C0]">
                    None of the recorded skills
                    currently meet the requirements.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {gapAnalysis.matched.map(
                    (skill) => (
                      <div
                        key={skill.id}
                        className="rounded-xl border border-[#232B47] p-4"
                      >
                        <div className="flex items-center justify-between gap-4">

                          <div>
                            <p className="font-medium">
                              {skill.name}
                            </p>

                            {skill.category && (
                              <p className="mt-1 text-xs text-[#9AA3C0]">
                                {skill.category}
                              </p>
                            )}
                          </div>

                          <span className="rounded-full bg-[#2BA792]/10 px-3 py-1 text-xs font-medium text-[#6fd6c4]">
                            ✓ Match
                          </span>

                        </div>

                        <div className="mt-4 flex justify-between text-xs">
                          <span className="text-[#9AA3C0]">
                            Your level
                          </span>

                          <span className="font-medium text-[#C7CCE0]">
                            {levelLabel(
                              skill.studentLevel
                            )}
                          </span>
                        </div>

                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-[#9AA3C0]">
                            Required
                          </span>

                          <span className="font-medium text-[#C7CCE0]">
                            {levelLabel(
                              skill.requiredLevel
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* ACTION */}

            <section className="rounded-2xl border border-[#F4A93B]/20 bg-[#F4A93B]/[0.06] p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="text-xl font-bold">
                    Ready to close these gaps?
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm text-[#C7CCE0]">
                    Turn your highest-priority skill
                    gaps into a focused learning
                    roadmap.
                  </p>
                </div>

                <Link
  href={
    selectedOpportunity
      ? `/student/roadmap?opportunityId=${selectedOpportunity.id}`
      : "/student/roadmap"
  }
  className="shrink-0 rounded-xl bg-[#F4A93B] px-6 py-3 text-center text-sm font-semibold text-[#0F1526] transition hover:bg-[#f6bd6a]"
>
  Build My Roadmap →
</Link>

              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/*
 * ============================================================
 * PAGE HEADER
 * ============================================================
 */

function PageHeader() {
  return (
    <section>
      <p className="text-sm font-medium tracking-wide text-[#F4A93B]">
        SKILL GAP ANALYSIS
      </p>

      <h1 className="mt-2 text-3xl font-bold md:text-4xl">
        Find what&apos;s holding you back.
      </h1>

      <p className="mt-2 max-w-2xl text-[#9AA3C0]">
        Compare your Skill DNA against real
        opportunity requirements and see exactly
        what to improve next.
      </p>
    </section>
  );
}

/*
 * ============================================================
 * SUMMARY STAT
 * ============================================================
 */

function SummaryStat({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div>
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

/*
 * ============================================================
 * SKILL GAP CARD
 * ============================================================
 */

function SkillGapCard({
  skill,
  rank,
  opportunityId,
}: {
  skill: SkillMatch;
  rank: number;
  opportunityId: string;
}) {
  const missing = isMissingSkill(skill);
  const gap = gapSize(skill);

  const priority =
    skill.required && skill.weight >= 1.5
      ? "High"
      : skill.required
      ? "Medium"
      : "Low";

  return (
    <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

        <div className="flex gap-4">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8598B]/10 text-sm font-bold text-[#f083a8]">
            {rank}
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-lg font-semibold">
                {skill.name}
              </h3>

              {skill.category && (
                <span className="rounded-full border border-[#232B47] px-2 py-1 text-[10px] uppercase tracking-wide text-[#9AA3C0]">
                  {skill.category}
                </span>
              )}

            </div>

            <p className="mt-2 text-sm text-[#9AA3C0]">
              {missing
                ? "You haven't recorded this skill yet."
                : `You are ${gap} competency level${
                    gap === 1 ? "" : "s"
                  } below the requirement.`}
            </p>

          </div>

        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
            priority === "High"
              ? "bg-[#E8598B]/10 text-[#f083a8]"
              : priority === "Medium"
              ? "bg-[#F4A93B]/10 text-[#F4A93B]"
              : "bg-white/5 text-[#9AA3C0]"
          }`}
        >
          {priority} priority
        </span>

      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <LevelBox
          label="Current"
          value={
            missing
              ? "Not acquired"
              : levelLabel(
                  skill.studentLevel
                )
          }
        />

        <LevelBox
          label="Required"
          value={levelLabel(
            skill.requiredLevel
          )}
        />

        <LevelBox
          label="Evidence"
          value={
            skill.evidenceCount > 0
              ? `${skill.evidenceCount} recorded`
              : "None"
          }
        />

      </div>

      <div className="mt-6">

        <div className="mb-2 flex justify-between text-xs">

          <span className="text-[#9AA3C0]">
            Current capability
          </span>

          <span className="text-[#C7CCE0]">
            {levelLabel(
              skill.studentLevel
            )}
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-[#E8598B] transition-all"
            style={{
              width: `${Math.min(
                skill.trustedProficiency,
                100
              )}%`,
            }}
          />

        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="text-xs text-[#5B6488]">
          {skill.required
            ? "Required for this opportunity"
            : "Preferred skill"}
          {" · "}
          Weight {skill.weight}
        </div>

        <Link
          href={`/student/roadmap?opportunityId=${encodeURIComponent(
            opportunityId
          )}`}
          className="rounded-xl border border-[#F4A93B]/30 px-4 py-2 text-center text-sm font-medium text-[#F4A93B] transition hover:bg-[#F4A93B]/10"
        >
          Add to Roadmap →
        </Link>

      </div>
    </div>
  );
}

/*
 * ============================================================
 * LEVEL BOX
 * ============================================================
 */

function LevelBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/50 p-4">

      <p className="text-xs text-[#9AA3C0]">
        {label}
      </p>

      <p className="mt-2 font-medium text-[#C7CCE0]">
        {value}
      </p>

    </div>
  );
}