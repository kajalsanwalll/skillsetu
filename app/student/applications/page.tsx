"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CompetencyLevel =
  | "EXPOSURE"
  | "FOUNDATIONAL"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

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
      requiredLevel: CompetencyLevel;
      weight: number;
    }[];
  };
};

export default function StudentApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/student/applications", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load applications."
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

    // Initial load
    loadApplications();

    // Check for status changes every 10 seconds
    const interval = setInterval(loadApplications, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#9AA3C0]">
            Loading your applications…
          </p>
        </div>

        <ThemeStyles />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#F3AFC6]">
            {error}
          </div>
        </div>

        <ThemeStyles />
      </main>
    );
  }

  const appliedCount = applications.filter(
    (application) =>
      application.status.toUpperCase() === "APPLIED"
  ).length;

  const shortlistedCount = applications.filter(
    (application) =>
      application.status.toUpperCase() === "SHORTLISTED"
  ).length;

  const selectedCount = applications.filter(
    (application) =>
      application.status.toUpperCase() === "SELECTED"
  ).length;

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <section className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E8598B] mb-2">
            Application tracking
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight">
            My Applications
          </h1>

          <p className="text-[#C7CCE0] mt-3 max-w-2xl">
            Track the opportunities you have applied
            to and monitor your application status.
          </p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Applications"
            value={applications.length}
            accent="#E8598B"
          />

          <StatCard
            label="Applied"
            value={appliedCount}
            accent="#9AA3C0"
          />

          <StatCard
            label="Shortlisted"
            value={shortlistedCount}
            accent="#2BA792"
          />

          <StatCard
            label="Selected"
            value={selectedCount}
            accent="#5FD6BE"
          />
        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#232B47] p-12 text-center">
            <div className="text-4xl mb-4">
              📋
            </div>

            <h2 className="font-serif text-xl">
              No applications yet
            </h2>

            <p className="text-[#9AA3C0] mt-2 max-w-md mx-auto">
              You have not applied to any
              opportunities yet. Explore available
              opportunities and find your next
              opportunity.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/student/opportunities")
              }
              className="mt-6 rounded-xl bg-[#E8598B] px-5 py-3 text-sm font-medium text-[#0F1526] transition hover:bg-[#f082ab]"
            >
              Explore Opportunities
            </button>
          </div>
        ) : (
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

      <ThemeStyles />
    </main>
  );
}

/* ---------------------------------------------
   THEME FONTS
--------------------------------------------- */

function ThemeStyles() {
  return (
    <style>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz@0,9..144;1,9..144&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap");

      .font-serif {
        font-family: "Fraunces", serif;
      }

      .font-sans {
        font-family: "IBM Plex Sans", sans-serif;
      }

      .font-mono {
        font-family: "IBM Plex Mono", monospace;
      }
    `}</style>
  );
}

/* ---------------------------------------------
   STAT CARD
--------------------------------------------- */

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-5">
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />

        <p className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
          {label}
        </p>
      </div>

      <p
        className="font-serif text-3xl mt-2"
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------------------------------------------
   APPLICATION CARD
--------------------------------------------- */

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
    <article className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6 transition hover:border-[#E8598B]/30">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Opportunity Information */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="rounded-full border border-[#E8598B]/25 bg-[#E8598B]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-[#E8598B]">
              {application.opportunity.type.replaceAll(
                "_",
                " "
              )}
            </span>

            <StatusBadge status={application.status} />
          </div>

          <h2 className="font-serif text-2xl">
            {application.opportunity.title}
          </h2>

          <p className="text-[#F4A93B] mt-1">
            {application.opportunity.company}
          </p>

          <p className="text-[#C7CCE0] mt-4 leading-relaxed line-clamp-2">
            {application.opportunity.description}
          </p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-[#9AA3C0]">
            {application.opportunity.location && (
              <span>
                📍 {application.opportunity.location}
              </span>
            )}

            <span>
              📅 Applied {formattedDate}
            </span>
          </div>
        </div>

        {/* Match Score */}
        <div className="shrink-0 md:w-32 text-center">
          <div className="rounded-2xl border border-[#F4A93B]/25 bg-[#F4A93B]/10 p-4">
            <p className="font-serif text-3xl text-[#F4A93B]">
              {matchScore !== null
                ? `${matchScore}%`
                : "—"}
            </p>

            <p className="font-mono text-[11px] uppercase tracking-wide text-[#9AA3C0] mt-1">
              Skill Match
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 pt-5 border-t border-[#232B47]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Skills */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0] mb-3">
              Key Skills
            </p>

            <div className="flex flex-wrap gap-2">
              {application.opportunity.skills
                .slice(0, 5)
                .map((skill) => (
                  <SkillBadge
                    key={skill.id}
                    skill={skill}
                  />
                ))}

              {application.opportunity.skills.length >
                5 && (
                <span className="rounded-lg border border-[#232B47] px-3 py-1.5 text-xs text-[#7A82A6]">
                  +
                  {application.opportunity.skills.length -
                    5}{" "}
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
            className="shrink-0 rounded-xl border border-[#3A4266] px-5 py-3 text-sm text-[#F5F1E8] transition hover:border-[#E8598B] hover:text-[#E8598B]"
          >
            View Opportunity
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------
   SKILL BADGE
--------------------------------------------- */

function SkillBadge({
  skill,
}: {
  skill: Application["opportunity"]["skills"][number];
}) {
  const requiredClass = skill.required
    ? "border-[#2BA792]/25 bg-[#2BA792]/10 text-[#2BA792]"
    : "border-[#232B47] bg-[#0F1526]/60 text-[#9AA3C0]";

  return (
    <span
      className={`rounded-lg border px-3 py-1.5 text-xs ${requiredClass}`}
      title={`Required level: ${formatCompetencyLevel(
        skill.requiredLevel
      )}`}
    >
      {skill.name}
    </span>
  );
}

/* ---------------------------------------------
   COMPETENCY LEVEL FORMATTER
--------------------------------------------- */

function formatCompetencyLevel(
  level: CompetencyLevel
): string {
  switch (level) {
    case "EXPOSURE":
      return "Exposure";

    case "FOUNDATIONAL":
      return "Foundational";

    case "INTERMEDIATE":
      return "Intermediate";

    case "ADVANCED":
      return "Advanced";

    case "EXPERT":
      return "Expert";

    default:
      return level;
  }
}

/* ---------------------------------------------
   STATUS BADGE
--------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus = status.toUpperCase();

  // Default = APPLIED
  let className =
    "border-[#3A4266] bg-[#0F1526]/60 text-[#9AA3C0]";

  // Shortlisted
  if (normalizedStatus === "SHORTLISTED") {
    className =
      "border-[#2BA792]/30 bg-[#2BA792]/10 text-[#2BA792]";
  }

  // Rejected
  if (normalizedStatus === "REJECTED") {
    className =
      "border-[#E8598B]/30 bg-[#E8598B]/10 text-[#E8598B]";
  }

  // Selected
  if (normalizedStatus === "SELECTED") {
    className =
      "border-[#2BA792]/50 bg-[#2BA792]/20 text-[#5FD6BE]";
  }

  // Completed
  if (normalizedStatus === "COMPLETED") {
    className =
      "border-[#2BA792]/50 bg-[#2BA792]/20 text-[#5FD6BE]";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${className}`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}