"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  type: string;
  createdAt: string;
};

type Application = {
  id: string;
  matchScore: number | null;
  status: string;
  createdAt: string;
  opportunity: Opportunity;
};

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<
    Application[]
  >([]);

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

        setApplications(
          data.applications || []
        );
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

  function getStatusStyle(status: string) {
    switch (status) {
      case "SHORTLISTED":
        return "border-green-500/30 bg-green-500/10 text-green-300";

      case "REJECTED":
        return "border-red-500/30 bg-red-500/10 text-red-300";

      case "ACCEPTED":
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";

      case "UNDER_REVIEW":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

      default:
        return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    }
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

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
          <Link
            href="/student/dashboard"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            ← Back to Dashboard
          </Link>

          <p className="text-sm text-purple-400 mt-6 mb-2">
            STUDENT
          </p>

          <h1 className="text-4xl font-bold">
            My Applications
          </h1>

          <p className="text-gray-400 mt-2">
            Track the opportunities you have applied
            to and monitor your progress.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-400">
              Total Applications
            </p>

            <p className="text-3xl font-bold mt-2">
              {applications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-400">
              Shortlisted
            </p>

            <p className="text-3xl font-bold mt-2">
              {
                applications.filter(
                  (application) =>
                    application.status ===
                    "SHORTLISTED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-400">
              Average Match
            </p>

            <p className="text-3xl font-bold mt-2">
              {applications.length > 0
                ? Math.round(
                    applications.reduce(
                      (total, application) =>
                        total +
                        (application.matchScore ??
                          0),
                      0
                    ) /
                      applications.length
                  )
                : 0}
                %
            </p>
          </div>

        </section>

        {/* Applications */}
        <section>
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">

              <h2 className="text-xl font-semibold">
                No applications yet
              </h2>

              <p className="text-gray-500 mt-2">
                Find an opportunity that matches
                your skills and apply.
              </p>

              <Link
                href="/student/opportunities"
                className="inline-block mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:bg-purple-500 transition"
              >
                Explore Opportunities
              </Link>

            </div>
          ) : (
            <div className="space-y-4">

              {applications.map(
                (application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                      {/* Opportunity */}
                      <div className="min-w-0">

                        <p className="text-xs text-purple-400 uppercase tracking-wide mb-2">
                          {application.opportunity.type.replaceAll(
                            "_",
                            " "
                          )}
                        </p>

                        <h2 className="text-xl font-semibold">
                          {
                            application
                              .opportunity
                              .title
                          }
                        </h2>

                        <p className="text-gray-300 mt-1">
                          {
                            application
                              .opportunity
                              .company
                          }
                        </p>

                        {application.opportunity
                          .location && (
                          <p className="text-sm text-gray-500 mt-2">
                            📍{" "}
                            {
                              application
                                .opportunity
                                .location
                            }
                          </p>
                        )}

                      </div>

                      {/* Match */}
                      <div className="text-left md:text-right">

                        <p className="text-xs text-gray-500">
                          SkillSetu Match
                        </p>

                        <p className="text-3xl font-bold text-purple-300">
                          {Math.round(
                            application.matchScore ??
                              0
                          )}
                          %
                        </p>

                      </div>

                    </div>

                    {/* Bottom row */}
                    <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          {formatStatus(
                            application.status
                          )}
                        </span>

                        <span className="text-xs text-gray-500">
                          Applied{" "}
                          {new Date(
                            application.createdAt
                          ).toLocaleDateString()}
                        </span>

                      </div>

                      <Link
                        href={`/student/opportunities/${application.opportunity.id}`}
                        className="text-sm font-medium text-purple-400 hover:text-purple-300"
                      >
                        View Opportunity →
                      </Link>

                    </div>

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