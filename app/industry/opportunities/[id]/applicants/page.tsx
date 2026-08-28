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
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">
            Loading applicants...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/industry/opportunities"
            )
          }
          className="text-sm text-gray-500 hover:text-white transition mb-6"
        >
          ← Back to Opportunities
        </button>

        {/* Header */}
        <section className="mb-8">

          <p className="text-sm text-purple-400 mb-2">
            APPLICANT MANAGEMENT
          </p>

          <h1 className="text-4xl font-bold">
            {opportunity?.title}
          </h1>

          <p className="text-purple-300 mt-1">
            {opportunity?.company}
          </p>

          <p className="text-gray-500 mt-3">
            Review and manage candidates based
            on their verified Skill DNA.
          </p>

        </section>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <SummaryCard
            label="Total Applicants"
            value={applicants.length}
          />

          <SummaryCard
            label="Shortlisted"
            value={
              applicants.filter(
                (a) =>
                  a.status === "SHORTLISTED"
              ).length
            }
          />

          <SummaryCard
            label="Selected"
            value={
              applicants.filter(
                (a) =>
                  a.status === "SELECTED"
              ).length
            }
          />

        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
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

          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value)
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
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

        </div>

        {/* Empty */}
        {filteredApplicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">

            <div className="text-4xl mb-4">
              👥
            </div>

            <h2 className="text-xl font-semibold">
              No applicants found
            </h2>

            <p className="text-gray-500 mt-2">
              No candidates match the current
              filter.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

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
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

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
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-purple-500/30 transition">

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

        {/* Candidate */}
        <div className="flex-1">

          <div className="flex flex-wrap items-center gap-3">

            <div className="h-11 w-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 font-semibold">
              {applicant.student.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <h2 className="text-xl font-semibold">
                {applicant.student.name}
              </h2>

              <p className="text-sm text-gray-500">
                {applicant.student.email}
              </p>

            </div>

            <StatusBadge
              status={applicant.status}
            />

          </div>

          {/* Skills */}
          <div className="mt-5">

            <p className="text-sm font-medium text-gray-300 mb-3">
              Candidate Skills
            </p>

            <div className="flex flex-wrap gap-2">

              {applicant.skills
                .slice(0, 8)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-300"
                  >
                    {skill.name}

                    <span className="ml-2 text-purple-300">
                      {Math.round(
                        skill.proficiency
                      )}
                      %
                    </span>
                  </span>
                ))}

              {applicant.skills.length > 8 && (
                <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-500">
                  +
                  {applicant.skills.length -
                    8}{" "}
                  more
                </span>
              )}

            </div>

          </div>

          <p className="text-xs text-gray-600 mt-4">
            Applied {appliedDate}
          </p>

        </div>

        {/* Match */}
        <div className="shrink-0 flex flex-col items-center gap-3">

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-6 py-4 text-center min-w-[120px]">

            <p className="text-3xl font-bold text-purple-300">
              {matchScore !== null
                ? `${matchScore}%`
                : "—"}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Skill Match
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/industry/applications/${applicant.applicationId}`
              )
            }
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition"
          >
            View Candidate
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
    "border-white/10 bg-white/5 text-gray-300";

  if (normalized === "APPLIED") {
    className =
      "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }

  if (normalized === "UNDER_REVIEW") {
    className =
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  }

  if (normalized === "SHORTLISTED") {
    className =
      "border-green-500/20 bg-green-500/10 text-green-300";
  }

  if (normalized === "SELECTED") {
    className =
      "border-purple-500/20 bg-purple-500/10 text-purple-300";
  }

  if (normalized === "REJECTED") {
    className =
      "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {normalized.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}