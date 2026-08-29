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

// Shared select styling — matches the SkillSetu input language
const selectClass = `
  rounded-lg border border-[#232B47] bg-[#171E33]/60
  px-4 py-3 text-sm text-[#F5F1E8] outline-none transition
  focus:border-[#F4A93B] focus:ring-1 focus:ring-[#F4A93B]/30
`;

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
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#9AA3C0]">
            Loading applicants…
          </p>
        </div>
        <ThemeStyles />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#F3AFC6]">
            {error}
          </div>
        </div>
        <ThemeStyles />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/industry/opportunities"
            )
          }
          className="font-mono text-xs uppercase tracking-[0.15em] text-[#9AA3C0] hover:text-[#F5F1E8] transition mb-6"
        >
          ← Back to Opportunities
        </button>

        {/* Header */}
        <section className="mb-8">

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4A93B] mb-2">
            Applicant management
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight">
            {opportunity?.title}
          </h1>

          <p className="text-[#E8598B] mt-2">
            {opportunity?.company}
          </p>

          <p className="text-[#9AA3C0] mt-3 max-w-xl">
            Review and manage candidates based
            on their verified Skill DNA.
          </p>

        </section>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <SummaryCard
            label="Total Applicants"
            value={applicants.length}
            accent="#F4A93B"
          />

          <SummaryCard
            label="Shortlisted"
            value={
              applicants.filter(
                (a) =>
                  a.status === "SHORTLISTED"
              ).length
            }
            accent="#2BA792"
          />

          <SummaryCard
            label="Selected"
            value={
              applicants.filter(
                (a) =>
                  a.status === "SELECTED"
              ).length
            }
            accent="#E8598B"
          />

        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className={selectClass}
          >
            <option
              value="ALL"
              className="bg-[#0F1526]"
            >
              All Statuses
            </option>

            <option
              value="APPLIED"
              className="bg-[#0F1526]"
            >
              Applied
            </option>

            <option
              value="UNDER_REVIEW"
              className="bg-[#0F1526]"
            >
              Under Review
            </option>

            <option
              value="SHORTLISTED"
              className="bg-[#0F1526]"
            >
              Shortlisted
            </option>

            <option
              value="SELECTED"
              className="bg-[#0F1526]"
            >
              Selected
            </option>

            <option
              value="REJECTED"
              className="bg-[#0F1526]"
            >
              Rejected
            </option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value)
            }
            className={selectClass}
          >
            <option
              value="MATCH"
              className="bg-[#0F1526]"
            >
              Highest Match
            </option>

            <option
              value="LATEST"
              className="bg-[#0F1526]"
            >
              Most Recent
            </option>

            <option
              value="NAME"
              className="bg-[#0F1526]"
            >
              Name
            </option>
          </select>

        </div>

        {/* Empty */}
        {filteredApplicants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#232B47] p-12 text-center">

            <div className="text-4xl mb-4">
              👥
            </div>

            <h2 className="font-serif text-xl">
              No applicants found
            </h2>

            <p className="text-[#9AA3C0] mt-2">
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
   SUMMARY CARD
--------------------------------------------- */

function SummaryCard({
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
    <article className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6 transition hover:border-[#F4A93B]/30">

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

        {/* Candidate */}
        <div className="flex-1">

          <div className="flex flex-wrap items-center gap-3">

            <div className="h-11 w-11 rounded-full bg-[#F4A93B]/10 border border-[#F4A93B]/25 flex items-center justify-center font-serif text-[#F4A93B]">
              {applicant.student.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <h2 className="font-serif text-xl">
                {applicant.student.name}
              </h2>

              <p className="text-sm text-[#9AA3C0]">
                {applicant.student.email}
              </p>

            </div>

            <StatusBadge
              status={applicant.status}
            />

          </div>

          {/* Skills */}
          <div className="mt-5">

            <p className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0] mb-3">
              Candidate Skills
            </p>

            <div className="flex flex-wrap gap-2">

              {applicant.skills
                .slice(0, 8)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-lg border border-[#232B47] bg-[#0F1526]/60 px-3 py-2 text-xs text-[#C7CCE0]"
                  >
                    {skill.name}

                    <span className="ml-2 text-[#2BA792]">
                      {Math.round(
                        skill.proficiency
                      )}
                      %
                    </span>
                  </span>
                ))}

              {applicant.skills.length > 8 && (
                <span className="rounded-lg border border-[#232B47] px-3 py-2 text-xs text-[#7A82A6]">
                  +
                  {applicant.skills.length -
                    8}{" "}
                  more
                </span>
              )}

            </div>

          </div>

          <p className="font-mono text-[11px] text-[#5B6386] mt-4">
            Applied {appliedDate}
          </p>

        </div>

        {/* Match */}
        <div className="shrink-0 flex flex-col items-center gap-3">

          <div className="rounded-2xl border border-[#F4A93B]/25 bg-[#F4A93B]/10 px-6 py-4 text-center min-w-[120px]">

            <p className="font-serif text-3xl text-[#F4A93B]">
              {matchScore !== null
                ? `${matchScore}%`
                : "—"}
            </p>

            <p className="font-mono text-[11px] uppercase tracking-wide text-[#9AA3C0] mt-1">
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
            className="rounded-xl border border-[#3A4266] px-4 py-2 text-sm text-[#F5F1E8] transition hover:border-[#F4A93B] hover:text-[#F4A93B]"
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

  // Palette-native status colors — no red/blue/yellow/green defaults
  let className =
    "border-[#3A4266] bg-[#0F1526]/60 text-[#9AA3C0]"; // APPLIED (neutral)

  if (normalized === "UNDER_REVIEW") {
    className =
      "border-[#F4A93B]/30 bg-[#F4A93B]/10 text-[#F4A93B]";
  }

  if (normalized === "SHORTLISTED") {
    className =
      "border-[#2BA792]/30 bg-[#2BA792]/10 text-[#2BA792]";
  }

  if (normalized === "SELECTED") {
    className =
      "border-[#2BA792]/50 bg-[#2BA792]/20 text-[#5FD6BE]";
  }

  if (normalized === "REJECTED") {
    className =
      "border-[#E8598B]/30 bg-[#E8598B]/10 text-[#E8598B]";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${className}`}
    >
      {normalized.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}