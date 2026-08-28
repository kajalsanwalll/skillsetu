
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type StudentSkill = {
  id: string;
  name: string;
  category: string | null;
  proficiency: number;
  verificationStrength: string;
};

type Applicant = {
  applicationId: string;
  status: string;
  matchScore: number | null;
  appliedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  skills: StudentSkill[];
};

type Opportunity = {
  id: string;
  title: string;
  company: string;
};

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();

  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [applicants, setApplicants] =
    useState<Applicant[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [sortOrder, setSortOrder] =
    useState("MATCH");

  useEffect(() => {
    async function loadApplicants() {
      try {
        const response = await fetch(
          `/api/industry/opportunities/${opportunityId}/applicants`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load applicants."
          );
        }

        setOpportunity(data.opportunity);
        setApplicants(data.applicants || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load applicants."
        );
      } finally {
        setLoading(false);
      }
    }

    if (opportunityId) {
      loadApplicants();
    }
  }, [opportunityId]);

  const filteredApplicants = useMemo(() => {
    let result = [...applicants];

    // Status filtering
    if (statusFilter !== "ALL") {
      result = result.filter(
        (applicant) =>
          applicant.status === statusFilter
      );
    }

    // Sorting
    if (sortOrder === "MATCH") {
      result.sort(
        (a, b) =>
          (b.matchScore ?? -1) -
          (a.matchScore ?? -1)
      );
    }

    if (sortOrder === "LATEST") {
      result.sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() -
          new Date(a.appliedAt).getTime()
      );
    }

    if (sortOrder === "NAME") {
      result.sort((a, b) =>
        a.student.name.localeCompare(
          b.student.name
        )
      );
    }

    return result;
  }, [
    applicants,
    statusFilter,
    sortOrder,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08080c] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-10 w-80 rounded bg-white/10" />
            <div className="h-4 w-96 rounded bg-white/5" />

            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl border border-white/[0.07] bg-white/[0.025]"
                />
              ))}
            </div>

            <div className="h-32 rounded-2xl border border-white/[0.07] bg-white/[0.025]" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#08080c] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/industry/opportunities"
              )
            }
            className="mb-8 text-sm text-gray-500 transition hover:text-white"
          >
            ← Back to Opportunities
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 text-red-300">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠</span>
              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>
                <p className="mt-1 text-sm text-red-300/80">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080c] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-purple-600/[0.08] blur-[130px]" />
        <div className="absolute right-[-100px] top-[25%] h-[420px] w-[420px] rounded-full bg-indigo-600/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/industry/opportunities"
            )
          }
          className="group mb-8 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          Back to Opportunities
        </button>

        {/* Header */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
              Applicant Management
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {opportunity?.title}
              </h1>

              <p className="mt-2 text-base font-medium text-purple-300">
                {opportunity?.company}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Review and manage candidates based on
                their verified Skill DNA and skill-match
                performance.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4 text-right lg:block">
              <p className="text-xs uppercase tracking-wider text-gray-600">
                Candidates
              </p>

              <p className="mt-1 text-2xl font-bold">
                {applicants.length}
              </p>
            </div>
          </div>
        </section>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Applicants"
            value={applicants.length}
            icon="👥"
          />

          <SummaryCard
            label="Shortlisted"
            value={
              applicants.filter(
                (a) =>
                  a.status === "SHORTLISTED"
              ).length
            }
            icon="✓"
            accent="green"
          />

          <SummaryCard
            label="Selected"
            value={
              applicants.filter(
                (a) =>
                  a.status === "SELECTED"
              ).length
            }
            icon="★"
            accent="purple"
          />
        </div>

        {/* Filters */}
        <section className="mb-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-200">
                Candidate Pipeline
              </p>

              <p className="mt-1 text-xs text-gray-600">
                {filteredApplicants.length}{" "}
                candidate
                {filteredApplicants.length !== 1
                  ? "s"
                  : ""}{" "}
                shown
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    min-w-[190px]
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-black/30
                    px-4
                    py-3
                    pr-10
                    text-sm
                    text-gray-300
                    outline-none
                    transition
                    hover:border-white/[0.14]
                    focus:border-purple-500/50
                    focus:ring-1
                    focus:ring-purple-500/20
                    sm:w-auto
                  "
                >
                  <option
                    value="ALL"
                    className="bg-[#0b0b0f]"
                  >
                    All Statuses
                  </option>

                  <option
                    value="APPLIED"
                    className="bg-[#0b0b0f]"
                  >
                    Applied
                  </option>

                  <option
                    value="UNDER_REVIEW"
                    className="bg-[#0b0b0f]"
                  >
                    Under Review
                  </option>

                  <option
                    value="SHORTLISTED"
                    className="bg-[#0b0b0f]"
                  >
                    Shortlisted
                  </option>

                  <option
                    value="SELECTED"
                    className="bg-[#0b0b0f]"
                  >
                    Selected
                  </option>

                  <option
                    value="REJECTED"
                    className="bg-[#0b0b0f]"
                  >
                    Rejected
                  </option>
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                  ▼
                </span>
              </div>

              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    min-w-[190px]
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-black/30
                    px-4
                    py-3
                    pr-10
                    text-sm
                    text-gray-300
                    outline-none
                    transition
                    hover:border-white/[0.14]
                    focus:border-purple-500/50
                    focus:ring-1
                    focus:ring-purple-500/20
                    sm:w-auto
                  "
                >
                  <option
                    value="MATCH"
                    className="bg-[#0b0b0f]"
                  >
                    Highest Match
                  </option>

                  <option
                    value="LATEST"
                    className="bg-[#0b0b0f]"
                  >
                    Most Recent
                  </option>

                  <option
                    value="NAME"
                    className="bg-[#0b0b0f]"
                  >
                    Name
                  </option>
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                  ▼
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Empty */}
        {filteredApplicants.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/[0.09] bg-white/[0.02] p-14 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-2xl">
              👥
            </div>

            <h2 className="text-xl font-semibold">
              No applicants found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              No candidates match the current filter.
              Try selecting a different status or sort
              option.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map(
              (applicant) => (
                <ApplicantCard
                  key={applicant.applicationId}
                  applicant={applicant}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------------------------------------
   SUMMARY CARD
--------------------------------------------- */

function SummaryCard({
  label,
  value,
  icon,
  accent = "purple",
}: {
  label: string;
  value: number;
  icon: string;
  accent?: "purple" | "green";
}) {
  const accentClasses =
    accent === "green"
      ? "border-green-500/10 bg-green-500/[0.035] text-green-300"
      : "border-purple-500/10 bg-purple-500/[0.035] text-purple-300";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.04]">
      <div
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl border text-sm ${accentClasses}`}
      >
        {icon}
      </div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl" />
    </div>
  );
}

/* ---------------------------------------------
   APPLICANT CARD
--------------------------------------------- */

function ApplicantCard({
  applicant,
}: {
  applicant: Applicant;
}) {
  const router = useRouter();

  const matchScore =
    applicant.matchScore !== null
      ? Math.round(applicant.matchScore)
      : null;

  const appliedDate = new Date(
    applicant.appliedAt
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm transition-all duration-200 hover:border-purple-500/20 hover:bg-white/[0.035] sm:p-6">

      {/* Hover glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-purple-500/[0.04] blur-3xl transition-all duration-300 group-hover:bg-purple-500/[0.08]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        {/* Candidate */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-indigo-500/10 text-base font-bold text-purple-300">
              {applicant.student.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white sm:text-xl">
                {applicant.student.name}
              </h2>

              <p className="truncate text-sm text-gray-500">
                {applicant.student.email}
              </p>
            </div>

            <StatusBadge
              status={applicant.status}
            />
          </div>

          {/* Skills */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Candidate Skills
              </p>

              <span className="text-xs text-gray-700">
                {applicant.skills.length} total
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {applicant.skills
                .slice(0, 8)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className="
                      rounded-xl
                      border
                      border-white/[0.07]
                      bg-black/20
                      px-3
                      py-2
                      text-xs
                      text-gray-300
                      transition-colors
                      hover:border-purple-500/20
                      hover:bg-purple-500/[0.05]
                    "
                  >
                    {skill.name}

                    <span className="ml-2 font-semibold text-purple-300">
                      {Math.round(
                        skill.proficiency
                      )}
                      %
                    </span>
                  </span>
                ))}

              {applicant.skills.length > 8 && (
                <span className="rounded-xl border border-white/[0.07] px-3 py-2 text-xs text-gray-600">
                  +
                  {applicant.skills.length -
                    8}{" "}
                  more
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-gray-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
            Applied {appliedDate}
          </div>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-center">

          {/* Match score */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/[0.06] px-6 py-4 text-center sm:min-w-[125px]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-purple-500/10 blur-xl" />

            <p className="relative text-3xl font-bold tracking-tight text-purple-300">
              {matchScore !== null
                ? `${matchScore}%`
                : "—"}
            </p>

            <p className="relative mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Skill Match
            </p>
          </div>

          {/* View button */}
          <button
            type="button"
            onClick={() =>
              router.push(
                `/industry/applications/${applicant.applicationId}`
              )
            }
            className="
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.02]
              px-5
              py-3
              text-sm
              font-medium
              text-gray-300
              transition-all
              hover:border-purple-500/30
              hover:bg-purple-500/[0.06]
              hover:text-white
            "
          >
            View Candidate
            <span className="ml-2 text-gray-600 transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------
   STATUS BADGE
--------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toUpperCase();

  let className =
    "border-white/[0.08] bg-white/[0.04] text-gray-400";

  if (normalized === "APPLIED") {
    className =
      "border-blue-500/20 bg-blue-500/[0.08] text-blue-300";
  }

  if (normalized === "UNDER_REVIEW") {
    className =
      "border-yellow-500/20 bg-yellow-500/[0.08] text-yellow-300";
  }

  if (normalized === "SHORTLISTED") {
    className =
      "border-green-500/20 bg-green-500/[0.08] text-green-300";
  }

  if (normalized === "SELECTED") {
    className =
      "border-purple-500/20 bg-purple-500/[0.08] text-purple-300";
  }

  if (normalized === "REJECTED") {
    className =
      "border-red-500/20 bg-red-500/[0.08] text-red-300";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${className}`}
    >
      {normalized.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}

