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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400">
            Loading your applications...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <section className="mb-10">
          <p className="text-sm text-purple-400 mb-2">
            APPLICATION TRACKING
          </p>

          <h1 className="text-4xl font-bold">
            My Applications
          </h1>

          <p className="text-gray-400 mt-2 max-w-2xl">
            Track the opportunities you have applied
            to and monitor your application status.
          </p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <StatCard
            label="Total Applications"
            value={applications.length}
          />

          <StatCard
            label="Applied"
            value={
              applications.filter(
                (application) =>
                  application.status === "APPLIED"
              ).length
            }
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
          />

        </div>

        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">

            <div className="text-4xl mb-4">
              📋
            </div>

            <h2 className="text-xl font-semibold">
              No applications yet
            </h2>

            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              You have not applied to any
              opportunities yet. Explore available
              opportunities and find your next
              opportunity.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/student/opportunities"
                )
              }
              className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500 transition"
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
    </main>
  );
}

/* ---------------------------------------------
   STAT CARD
--------------------------------------------- */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-3xl font-bold text-white mt-2">
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
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-purple-500/30 transition">

      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

        {/* Opportunity Information */}
        <div className="flex-1">

          <div className="flex flex-wrap items-center gap-3 mb-3">

            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              {application.opportunity.type.replaceAll(
                "_",
                " "
              )}
            </span>

            <StatusBadge
              status={application.status}
            />

          </div>

          <h2 className="text-2xl font-semibold">
            {application.opportunity.title}
          </h2>

          <p className="text-purple-300 mt-1">
            {application.opportunity.company}
          </p>

          <p className="text-gray-400 mt-4 leading-relaxed line-clamp-2">
            {application.opportunity.description}
          </p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">

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

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">

            <p className="text-3xl font-bold text-purple-300">
              {matchScore !== null
                ? `${matchScore}%`
                : "—"}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Skill Match
            </p>

          </div>

        </div>

      </div>

      {/* Divider */}
      <div className="mt-6 pt-5 border-t border-white/10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Skills */}
          <div>

            <p className="text-sm font-medium text-gray-300 mb-3">
              Key Skills
            </p>

            <div className="flex flex-wrap gap-2">

              {application.opportunity.skills
                .slice(0, 5)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs ${
                      skill.required
                        ? "border-purple-500/20 bg-purple-500/10 text-purple-200"
                        : "border-white/10 bg-white/[0.03] text-gray-400"
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}

              {application.opportunity.skills.length >
                5 && (
                <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-500">
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
            className="shrink-0 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 transition"
          >
            View Opportunity
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
      className={`rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {normalizedStatus.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}