
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Application = {
  id: string;
  status: string;
  matchScore: number | null;
  createdAt: string;

  opportunity: {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string | null;
    type: string;

    industry: {
      name: string;
    };

    skills: {
      id: string;
      name: string;
      category: string | null;
      required: boolean;
      minimumProficiency: number;
      weight: number;
    }[];
  };
};

export default function StudentApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch(
          "/api/student/applications"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load applications."
          );
        }

        setApplications(data.applications || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load applications."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  /* ---------------------------------------------
     LOADING STATE
  --------------------------------------------- */

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-6 py-10 text-white">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
          <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[130px]" />
        </div>

        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-400" />
            </div>

            <h2 className="text-lg font-semibold">
              Loading your applications
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Fetching your latest application activity...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------
     ERROR STATE
  --------------------------------------------- */

  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-6 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
          <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[130px]" />
        </div>

        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">

            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300">
              !
            </div>

            <h2 className="text-xl font-semibold">
              Unable to load applications
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-300/80">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

      {/* ============================================
          BACKGROUND
      ============================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/[0.025] blur-[120px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* ============================================
            HEADER
        ============================================ */}

        <section className="mb-10">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <span className="text-lg font-bold">
                S
              </span>
            </div>

            <span className="text-lg font-semibold tracking-tight">
              SkillSetu
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-500/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                APPLICATION TRACKING
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                My Applications
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                Track the opportunities you&apos;ve applied
                to and stay updated on your application
                progress.
              </p>

            </div>

            {/* Application count */}

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-bold text-indigo-300">
                {applications.length}
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Total
                </p>

                <p className="text-sm font-medium text-gray-300">
                  Applications
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================
            STATS
        ============================================ */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            label="Total Applications"
            value={applications.length}
            icon="📋"
          />

          <StatCard
            label="Applied"
            value={
              applications.filter(
                (application) =>
                  application.status === "APPLIED"
              ).length
            }
            icon="↗"
          />

          <StatCard
            label="Shortlisted"
            value={
              applications.filter(
                (application) =>
                  application.status ===
                  "SHORTLISTED"
              ).length
            }
            icon="✓"
          />

        </div>

        {/* ============================================
            EMPTY STATE
        ============================================ */}

        {applications.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center sm:px-12">

            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[70px]" />

            <div className="relative">

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-4xl shadow-xl">
                📋
              </div>

              <h2 className="text-2xl font-semibold">
                No applications yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
                You haven&apos;t applied to any
                opportunities yet. Explore available
                opportunities and find your next
                career move.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/student/opportunities"
                  )
                }
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/30"
              >
                Explore Opportunities

                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </button>

            </div>
          </div>
        ) : (
          /* ============================================
             APPLICATION LIST
          ============================================ */

          <div className="space-y-5">

            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

/* =============================================
   STAT CARD
============================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-all duration-300 hover:border-indigo-500/20 hover:bg-white/[0.04]">

      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-500/[0.05] blur-2xl transition-all group-hover:bg-indigo-500/[0.1]" />

      <div className="relative flex items-start justify-between">

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =============================================
   APPLICATION CARD
============================================= */

function ApplicationCard({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();

  const matchScore =
    application.matchScore !== null
      ? Math.round(application.matchScore)
      : null;

  const formattedDate = new Date(
    application.createdAt
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition-all duration-300 hover:border-indigo-500/25 hover:bg-white/[0.035] sm:p-6">

      {/* Hover glow */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/[0.06] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* ==========================================
          TOP SECTION
      ========================================== */}

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

        {/* Opportunity Information */}

        <div className="flex-1">

          {/* Badges */}

          <div className="mb-4 flex flex-wrap items-center gap-2">

            <span className="rounded-full border border-indigo-400/10 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
              {application.opportunity.type.replaceAll(
                "_",
                " "
              )}
            </span>

            <StatusBadge
              status={application.status}
            />

          </div>

          {/* Title */}

          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {application.opportunity.title}
          </h2>

          {/* Company */}

          <p className="mt-1.5 text-sm font-medium text-indigo-300">
            {application.opportunity.company}
          </p>

          {/* Description */}

          <p className="mt-4 line-clamp-2 max-w-3xl text-sm leading-7 text-gray-400">
            {application.opportunity.description}
          </p>

          {/* Metadata */}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

            {application.opportunity.location && (
              <span className="flex items-center gap-1.5">
                <span className="text-sm">📍</span>
                {application.opportunity.location}
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <span className="text-sm">📅</span>
              Applied {formattedDate}
            </span>

          </div>

        </div>

        {/* ==========================================
            MATCH SCORE
        ========================================== */}

        <div className="shrink-0 md:w-32">

          <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.12] to-purple-500/[0.06] p-4 text-center">

            <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Skill Match
            </div>

            <p className="text-3xl font-bold tracking-tight text-indigo-300">
              {matchScore !== null
                ? `${matchScore}%`
                : "—"}
            </p>

            {matchScore !== null && (
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{
                    width: `${Math.min(
                      matchScore,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ==========================================
          DIVIDER
      ========================================== */}

      <div className="relative mt-6 border-t border-white/[0.08] pt-5">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          {/* Skills */}

          <div className="min-w-0">

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Key Skills
            </p>

            <div className="flex flex-wrap gap-2">

              {application.opportunity.skills
                .slice(0, 5)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      skill.required
                        ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-200"
                        : "border-white/10 bg-white/[0.025] text-gray-400"
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}

              {application.opportunity.skills.length >
                5 && (
                <span className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-gray-500">
                  +
                  {application.opportunity.skills
                    .length - 5}{" "}
                  more
                </span>
              )}

            </div>

          </div>

          {/* Action */}

          <button
            type="button"
            onClick={() =>
              router.push(
                `/student/opportunities/${application.opportunity.id}`
              )
            }
            className="group/btn flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-gray-300 transition-all hover:border-indigo-500/20 hover:bg-indigo-500/[0.06] hover:text-white"
          >
            View Opportunity

            <svg
              className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </button>

        </div>

      </div>

    </article>
  );
}

/* =============================================
   STATUS BADGE
============================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.toUpperCase();

  let className =
    "border-white/10 bg-white/5 text-gray-300";

  if (normalizedStatus === "APPLIED") {
    className =
      "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }

  if (normalizedStatus === "SHORTLISTED") {
    className =
      "border-green-500/20 bg-green-500/10 text-green-300";
  }

  if (normalizedStatus === "REJECTED") {
    className =
      "border-red-500/20 bg-red-500/10 text-red-300";
  }

  if (normalizedStatus === "SELECTED") {
    className =
      "border-purple-500/20 bg-purple-500/10 text-purple-300";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${className}`}
    >
      {normalizedStatus.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}
