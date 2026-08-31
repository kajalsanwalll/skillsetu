
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Skill = {
  id: string;
  skillId: string;
  name: string;
  category: string | null;
  proficiency: number;
  verificationStrength: string;
};

type Evidence = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  score: number | null;
  verified: boolean;
  verificationStrength: string;
  createdAt: string;
  skill: {
    id: string;
    name: string;
    category: string | null;
  } | null;
};

type Credential = {
  id: string;
  source: string;
  credentialId: string | null;
  title: string;
  institution: string | null;
  score: number | null;
  credits: number | null;
  issueDate: string | null;
  verificationUrl: string | null;
  verified: boolean;
  verificationStrength: string;
  createdAt: string;
};

type Assessment = {
  id: string;
  score: number | null;
  createdAt: string;
};

type Application = {
  id: string;
  status: string;
  matchScore: number | null;
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
    type: string | null;
    industry: {
      name: string;
    } | null;
  };
};

type PortfolioData = {
  student: {
    id: string;
    name: string;
    email: string;
  };

  profile: {
    id: string;
    careerInterest: string | null;
    [key: string]: unknown;
  };

  skills: Skill[];
  evidence: Evidence[];
  credentials: Credential[];
  assessments: Assessment[];
  applications: Application[];

  stats: {
    totalSkills: number;
    verifiedSkills: number;
    totalEvidence: number;
    verifiedEvidence: number;
    totalCredentials: number;
    verifiedCredentials: number;
    totalApplications: number;
  };
};

const TEAL = "#2BA792";
const MARIGOLD = "#F4A93B";
const ROSE = "#E8598B";
const MUTED = "#9AA3C0";

function verificationColor(strength: string) {
  switch (strength) {
    case "HIGH":
      return TEAL;
    case "MEDIUM":
      return MARIGOLD;
    case "LOW":
      return ROSE;
    default:
      return MUTED;
  }
}

function formatType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(date: string | null) {
  if (!date) return "Date not available";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function StudentPortfolioPage() {
  const [data, setData] =
    useState<PortfolioData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPortfolio() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/student/portfolio"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to load portfolio."
        );
      }

      setData(result.portfolio);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load portfolio."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-6xl">
          <p className="text-[#9AA3C0]">
            Loading your portfolio…
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/student/dashboard"
            className="text-sm text-[#9AA3C0] hover:text-[#F5F1E8]"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-8 rounded-2xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-6">
            <p className="text-sm text-[#F3AFC6]">
              {error ||
                "Unable to load your portfolio."}
            </p>

            <button
              onClick={loadPortfolio}
              className="mt-4 rounded-xl bg-[#E8598B] px-4 py-2 text-sm font-medium text-[#0F1526]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const {
    student,
    profile,
    skills,
    evidence,
    credentials,
    assessments,
    applications,
    stats,
  } = data;

  const averageSkill =
    skills.length > 0
      ? Math.round(
          skills.reduce(
            (sum, skill) =>
              sum + skill.proficiency,
            0
          ) / skills.length
        )
      : 0;

  const verificationPercentage =
    skills.length > 0
      ? Math.round(
          (stats.verifiedSkills /
            skills.length) *
            100
        )
      : 0;

  const verifiedEvidence = evidence.filter(
    (item) => item.verified
  );

  const projects = evidence.filter(
    (item) =>
      item.type === "PROJECT"
  );

  const categories = Array.from(
    new Set(
      skills
        .map((skill) => skill.category)
        .filter(
          (category): category is string =>
            Boolean(category)
        )
    )
  );

  const strongSkills = [...skills]
    .sort(
      (a, b) =>
        b.proficiency - a.proficiency
    )
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <section>
          <Link
            href="/student/dashboard"
            className="text-sm text-[#9AA3C0] transition hover:text-[#F5F1E8]"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-sm font-medium tracking-wide text-[#F4A93B]">
                STUDENT PORTFOLIO
              </p>

              <h1 className="mt-2 text-4xl font-bold md:text-5xl">
                {student.name}
              </h1>

              <p className="mt-3 max-w-2xl text-[#9AA3C0]">
                {profile.careerInterest ||
                  "Student building a verified skill profile"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map(
                  (category) => (
                    <span
                      key={category}
                      className="rounded-full border border-[#232B47] bg-[#171E33]/60 px-3 py-1 text-xs text-[#C7CCE0]"
                    >
                      {category}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/student/skill-dna"
                className="rounded-xl border border-[#232B47] px-4 py-2 text-sm text-[#C7CCE0] transition hover:border-[#F4A93B]/50 hover:text-[#F5F1E8]"
              >
                View Skill DNA
              </Link>

              <Link
                href="/student/evidence"
                className="rounded-xl bg-[#F4A93B] px-4 py-2 text-sm font-medium text-[#0F1526] transition hover:bg-[#f6bd6a]"
              >
                Manage Evidence
              </Link>
            </div>

          </div>
        </section>

        {/* -------------------------------- */}
        {/* PROFILE SUMMARY */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div className="grid gap-6 md:grid-cols-3">

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-[#F4A93B]">
                PROFILE
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {profile.careerInterest ||
                  "Career interest not specified"}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9AA3C0]">
                This portfolio brings together your
                skills, evidence, credentials and
                application activity into one
                structured profile.
              </p>

              <p className="mt-3 text-sm text-[#5B6386]">
                {student.email}
              </p>
            </div>

            <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/50 p-5">
              <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">
                Skill DNA Strength
              </p>

              <p className="mt-2 text-4xl font-bold text-[#F4A93B]">
                {averageSkill}%
              </p>

              <p className="mt-1 text-xs text-[#9AA3C0]">
                Average self-reported proficiency
              </p>
            </div>

          </div>

        </section>

        {/* -------------------------------- */}
        {/* PORTFOLIO STATS */}
        {/* -------------------------------- */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            label="Skills"
            value={stats.totalSkills}
            description={`${stats.verifiedSkills} verified`}
            accent={MARIGOLD}
          />

          <StatCard
            label="Evidence"
            value={stats.totalEvidence}
            description={`${stats.verifiedEvidence} verified`}
            accent={TEAL}
          />

          <StatCard
            label="Credentials"
            value={stats.totalCredentials}
            description={`${stats.verifiedCredentials} verified`}
            accent={TEAL}
          />

          <StatCard
            label="Applications"
            value={stats.totalApplications}
            description="Opportunities applied to"
            accent={ROSE}
          />

        </section>

        {/* -------------------------------- */}
        {/* SKILLS */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-medium text-[#F4A93B]">
                SKILL DNA
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Core Capabilities
              </h2>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Your strongest recorded skills and
                their current verification strength.
              </p>
            </div>

            <Link
              href="/student/skill-dna"
              className="text-sm text-[#F4A93B] hover:text-[#f6bd6a]"
            >
              View full Skill DNA →
            </Link>

          </div>

          {strongSkills.length === 0 ? (
            <EmptyState
              message="No skills added yet."
              action="Build your Skill DNA →"
              href="/student/skill-dna"
            />
          ) : (
            <div className="mt-7 space-y-5">

              {strongSkills.map(
                (skill) => {
                  const color =
                    verificationColor(
                      skill.verificationStrength
                    );

                  return (
                    <div key={skill.id}>

                      <div className="mb-2 flex items-center justify-between gap-4">

                        <div>
                          <p className="font-medium">
                            {skill.name}
                          </p>

                          {skill.category && (
                            <p className="mt-1 text-xs text-[#5B6386]">
                              {skill.category}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">

                          <span className="text-sm text-[#C7CCE0]">
                            {Math.round(
                              skill.proficiency
                            )}
                            %
                          </span>

                          <span
                            className="rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide"
                            style={{
                              borderColor: `${color}50`,
                              color,
                              backgroundColor: `${color}10`,
                            }}
                          >
                            {skill.verificationStrength}
                          </span>

                        </div>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#F4A93B]"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                skill.proficiency,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* -------------------------------- */}
        {/* PROJECTS / EVIDENCE */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-medium text-[#F4A93B]">
                PROJECTS & EVIDENCE
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Proof of Capability
              </h2>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Evidence supporting the skills in your
                portfolio.
              </p>
            </div>

            <Link
              href="/student/evidence"
              className="text-sm text-[#F4A93B] hover:text-[#f6bd6a]"
            >
              Manage evidence →
            </Link>

          </div>

          {evidence.length === 0 ? (
            <EmptyState
              message="No evidence has been added yet."
              action="Add your first project →"
              href="/student/evidence"
            />
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {evidence
                .slice(0, 6)
                .map((item) => {

                  const color =
                    verificationColor(
                      item.verificationStrength
                    );

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-[#232B47] bg-[#0F1526]/50 p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full border border-[#E8598B]/30 bg-[#E8598B]/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#E8598B]">
                              {formatType(
                                item.type
                              )}
                            </span>

                            {item.verified && (
                              <span className="rounded-full border border-[#2BA792]/30 bg-[#2BA792]/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#2BA792]">
                                Verified
                              </span>
                            )}

                          </div>

                          <h3 className="mt-3 font-semibold">
                            {item.title}
                          </h3>

                          {item.skill && (
                            <p className="mt-1 text-sm text-[#F4A93B]">
                              {item.skill.name}
                            </p>
                          )}
                        </div>

                        {item.score !== null && (
                          <div className="shrink-0 text-right">
                            <p className="text-xl font-bold text-[#F4A93B]">
                              {item.score}%
                            </p>

                            <p className="text-[10px] uppercase tracking-wide text-[#5B6386]">
                              Score
                            </p>
                          </div>
                        )}

                      </div>

                      {item.description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#9AA3C0]">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">

                        <span
                          className="text-[10px] uppercase tracking-wide"
                          style={{
                            color,
                          }}
                        >
                          {item.verificationStrength}
                        </span>

                        <div className="flex gap-3">

                          <span className="text-xs text-[#5B6386]">
                            {formatDate(
                              item.createdAt
                            )}
                          </span>

                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-[#F4A93B] hover:text-[#f6bd6a]"
                            >
                              View →
                            </a>
                          )}

                        </div>

                      </div>

                    </article>
                  );
                })}

            </div>
          )}

        </section>

        {/* -------------------------------- */}
        {/* CREDENTIALS */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div>
            <p className="text-sm font-medium text-[#F4A93B]">
              CREDENTIALS
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Academic & Professional Credentials
            </h2>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Credentials associated with your student
              profile.
            </p>
          </div>

          {credentials.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[#232B47] p-6 text-center">
              <p className="text-sm text-[#9AA3C0]">
                No credentials added yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">

              {credentials
                .slice(0, 5)
                .map((credential) => {

                  const color =
                    verificationColor(
                      credential.verificationStrength
                    );

                  return (
                    <div
                      key={credential.id}
                      className="rounded-xl border border-[#232B47] bg-[#0F1526]/50 p-5"
                    >

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                          <h3 className="font-semibold">
                            {credential.title}
                          </h3>

                          {credential.institution && (
                            <p className="mt-1 text-sm text-[#C7CCE0]">
                              {credential.institution}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-[#5B6386]">
                            {credential.source}
                            {credential.issueDate
                              ? ` · ${formatDate(
                                  credential.issueDate
                                )}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">

                          <span
                            className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide"
                            style={{
                              borderColor: `${color}50`,
                              color,
                              backgroundColor: `${color}10`,
                            }}
                          >
                            {credential.verified
                              ? "Verified"
                              : "Pending"}
                          </span>

                          {credential.verificationUrl && (
                            <a
                              href={
                                credential.verificationUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#F4A93B] hover:text-[#f6bd6a]"
                            >
                              Verify →
                            </a>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                })}

            </div>
          )}

        </section>

        {/* -------------------------------- */}
        {/* APPLICATIONS */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-medium text-[#F4A93B]">
                OPPORTUNITY ACTIVITY
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Your latest applications and opportunity
                matches.
              </p>
            </div>

            <Link
              href="/student/applications"
              className="text-sm text-[#F4A93B] hover:text-[#f6bd6a]"
            >
              View all applications →
            </Link>

          </div>

          {applications.length === 0 ? (
            <EmptyState
              message="You haven't applied to any opportunities yet."
              action="Explore opportunities →"
              href="/student/opportunities"
            />
          ) : (
            <div className="mt-6 space-y-3">

              {applications
                .slice(0, 5)
                .map((application) => (

                  <div
                    key={application.id}
                    className="rounded-xl border border-[#232B47] bg-[#0F1526]/50 p-5"
                  >

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div>
                        <h3 className="font-semibold">
                          {
                            application
                              .opportunity
                              .title
                          }
                        </h3>

                        <p className="mt-1 text-sm text-[#C7CCE0]">
                          {
                            application
                              .opportunity
                              .company
                          }

                          {application
                            .opportunity
                            .location
                            ? ` · ${application.opportunity.location}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs text-[#5B6386]">
                          Applied{" "}
                          {formatDate(
                            application.createdAt
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">

                        {application.matchScore !==
                          null && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#F4A93B]">
                              {
                                application.matchScore
                              }
                              %
                            </p>

                            <p className="text-[10px] uppercase tracking-wide text-[#5B6386]">
                              Match
                            </p>
                          </div>
                        )}

                        <span className="rounded-full border border-[#232B47] px-3 py-1 text-[10px] uppercase tracking-wide text-[#C7CCE0]">
                          {formatType(
                            application.status
                          )}
                        </span>

                      </div>

                    </div>

                  </div>
                ))}

            </div>
          )}

        </section>

        {/* -------------------------------- */}
        {/* VERIFICATION SUMMARY */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#2BA792]/20 bg-[#2BA792]/5 p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-medium text-[#2BA792]">
                PORTFOLIO CREDIBILITY
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {verificationPercentage}% of your
                skills are verified
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9AA3C0]">
                Verification strength is based on the
                supporting evidence associated with your
                skills. Add strong evidence to make your
                portfolio more credible.
              </p>
            </div>

            <div className="shrink-0 text-left md:text-right">

              <p className="text-4xl font-bold text-[#2BA792]">
                {stats.verifiedEvidence}
              </p>

              <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">
                Verified evidence items
              </p>

            </div>

          </div>

        </section>

        {/* -------------------------------- */}
        {/* FOOTER NAV */}
        {/* -------------------------------- */}

        <section className="flex flex-wrap justify-center gap-4 border-t border-[#232B47] pt-6">

          <Link
            href="/student/dashboard"
            className="text-sm text-[#9AA3C0] hover:text-[#F5F1E8]"
          >
            Dashboard
          </Link>

          <Link
            href="/student/skill-dna"
            className="text-sm text-[#9AA3C0] hover:text-[#F5F1E8]"
          >
            Skill DNA
          </Link>

          <Link
            href="/student/evidence"
            className="text-sm text-[#9AA3C0] hover:text-[#F5F1E8]"
          >
            Evidence
          </Link>

          <Link
            href="/student/opportunities"
            className="text-sm text-[#9AA3C0] hover:text-[#F5F1E8]"
          >
            Opportunities
          </Link>

        </section>

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
  description,
  accent,
}: {
  label: string;
  value: number | string;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-5">

      <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">
        {label}
      </p>

      <p
        className="mt-2 text-3xl font-bold"
        style={{ color: accent }}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-[#9AA3C0]">
        {description}
      </p>

    </div>
  );
}

/* ---------------------------------------------
   EMPTY STATE
--------------------------------------------- */

function EmptyState({
  message,
  action,
  href,
}: {
  message: string;
  action: string;
  href: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-[#232B47] p-8 text-center">

      <p className="text-sm text-[#9AA3C0]">
        {message}
      </p>

      <Link
        href={href}
        className="mt-4 inline-block text-sm font-medium text-[#F4A93B] hover:text-[#f6bd6a]"
      >
        {action}
      </Link>

    </div>
  );
}
