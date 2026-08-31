"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Skill = {
  id: string;
  proficiency: number;
  competencyLevel: string | null;
  verificationStrength: string;
  skill: {
    id: string;
    name: string;
    category: string | null;
    description: string | null;
  };
};

type Evidence = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  score: number | null;
  verified: boolean;
  verificationStrength: string;
  createdAt: string;
  skill: {
    id: string;
    name: string;
  } | null;
};

type Assessment = {
  id: string;
  title: string;
  score: number;
  createdAt: string;
};

type AcademicCredential = {
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
};

type Application = {
  id: string;
  opportunityId: string;
  matchScore: number | null;
  status: string;
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    company: string;
    type: string;
  };
};

type Candidate = {
  id: string;
  careerInterest: string | null;
  bio: string | null;

  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };

  skills: Skill[];
  evidence: Evidence[];
  assessments: Assessment[];
  academicCredentials: AcademicCredential[];
  applications: Application[];
};

const TEAL = "#2BA792";
const MARIGOLD = "#F4A93B";
const ROSE = "#E8598B";

function levelColor(level: string | null) {
  switch (level) {
    case "EXPERT":
      return TEAL;
    case "ADVANCED":
      return "#6FD6C4";
    case "INTERMEDIATE":
      return MARIGOLD;
    case "FOUNDATIONAL":
      return "#C7CCE0";
    case "EXPOSURE":
      return ROSE;
    default:
      return "#9AA3C0";
  }
}

function verificationColor(strength: string) {
  switch (strength) {
    case "HIGH":
      return TEAL;
    case "MEDIUM":
      return MARIGOLD;
    case "LOW":
      return ROSE;
    default:
      return "#9AA3C0";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function IndustryCandidateProfilePage() {
  const params = useParams();
  const router = useRouter();

  const candidateId = params.id as string;

  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!candidateId) return;

    async function loadCandidate() {
      try {
        const response = await fetch(
          `/api/industry/candidates/${candidateId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load candidate."
          );
        }

        setCandidate(data.candidate);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load candidate."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, [candidateId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#9AA3C0]">
            Loading candidate...
          </p>
        </div>
      </main>
    );
  }

  if (error || !candidate) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <button
            type="button"
            onClick={() =>
              router.push("/industry/candidates")
            }
            className="mb-6 text-sm text-[#9AA3C0] hover:text-[#F5F1E8] transition"
          >
            ← Back to Candidates
          </button>

          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#f083a8]">
            {error || "Candidate not found."}
          </div>
        </div>
      </main>
    );
  }

  const verifiedSkills = candidate.skills.filter(
    (skill) =>
      skill.verificationStrength !== "UNVERIFIED"
  ).length;

  const verifiedEvidence = candidate.evidence.filter(
    (evidence) => evidence.verified
  ).length;

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push("/industry/candidates")
          }
          className="mb-8 text-sm text-[#9AA3C0] hover:text-[#F5F1E8] transition"
        >
          ← Back to Candidates
        </button>

        {/* Candidate Header */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            <div>
              <p className="text-sm text-[#F4A93B] mb-2">
                STUDENT PROFILE
              </p>

              <h1 className="text-3xl font-bold">
                {candidate.user.name}
              </h1>

              <p className="text-[#9AA3C0] mt-2">
                {candidate.user.email}
              </p>

              {candidate.careerInterest && (
                <div className="mt-4">
                  <span className="rounded-full border border-[#F4A93B]/30 bg-[#F4A93B]/10 px-3 py-1.5 text-xs text-[#F4A93B]">
                    {candidate.careerInterest}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/60 px-5 py-4 text-center">
                <p className="text-2xl font-bold">
                  {candidate.skills.length}
                </p>
                <p className="text-xs text-[#9AA3C0] mt-1">
                  Skills
                </p>
              </div>

              <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/60 px-5 py-4 text-center">
                <p className="text-2xl font-bold">
                  {candidate.evidence.length}
                </p>
                <p className="text-xs text-[#9AA3C0] mt-1">
                  Evidence
                </p>
              </div>

              <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/60 px-5 py-4 text-center">
                <p className="text-2xl font-bold">
                  {candidate.assessments.length}
                </p>
                <p className="text-xs text-[#9AA3C0] mt-1">
                  Assessments
                </p>
              </div>
            </div>
          </div>

          {candidate.bio && (
            <div className="mt-7 pt-6 border-t border-[#232B47]">
              <h2 className="font-semibold">
                About
              </h2>

              <p className="text-[#9AA3C0] mt-2 leading-relaxed">
                {candidate.bio}
              </p>
            </div>
          )}
        </section>

        {/* Verification Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-5">
            <p className="text-sm text-[#9AA3C0]">
              Verified Skills
            </p>

            <p
              className="text-2xl font-bold mt-2"
              style={{ color: TEAL }}
            >
              {verifiedSkills}
              <span className="text-sm text-[#9AA3C0] ml-1">
                / {candidate.skills.length}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-5">
            <p className="text-sm text-[#9AA3C0]">
              Verified Evidence
            </p>

            <p
              className="text-2xl font-bold mt-2"
              style={{ color: TEAL }}
            >
              {verifiedEvidence}
              <span className="text-sm text-[#9AA3C0] ml-1">
                / {candidate.evidence.length}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-5">
            <p className="text-sm text-[#9AA3C0]">
              Applications
            </p>

            <p
              className="text-2xl font-bold mt-2"
              style={{ color: MARIGOLD }}
            >
              {candidate.applications.length}
            </p>
          </div>

        </section>

        {/* Skill DNA */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-semibold">
                Skill DNA
              </h2>

              <p className="text-sm text-[#9AA3C0] mt-1">
                Verified and self-reported capabilities.
              </p>
            </div>
          </div>

          {candidate.skills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">
              <p className="text-[#9AA3C0]">
                No skills added yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {candidate.skills.map((studentSkill) => {
                const level = studentSkill.competencyLevel;
                const levelColorValue =
                  levelColor(level);

                const verification =
                  verificationColor(
                    studentSkill.verificationStrength
                  );

                return (
                  <div
                    key={studentSkill.id}
                    className="rounded-xl border border-[#232B47] bg-[#0F1526]/50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h3 className="font-semibold">
                          {studentSkill.skill.name}
                        </h3>

                        <p className="text-xs text-[#9AA3C0] mt-1">
                          {studentSkill.skill.category ||
                            "General"}
                        </p>
                      </div>

                      {level && (
                        <span
                          className="rounded-full border px-3 py-1 text-xs font-medium"
                          style={{
                            borderColor: `${levelColorValue}40`,
                            color: levelColorValue,
                          }}
                        >
                          {level}
                        </span>
                      )}
                    </div>

                    {studentSkill.skill.description && (
                      <p className="text-sm text-[#9AA3C0] mt-4">
                        {studentSkill.skill.description}
                      </p>
                    )}

                    <div className="mt-5 pt-4 border-t border-[#232B47]">
                      <span
                        className="text-xs"
                        style={{
                          color: verification,
                        }}
                      >
                        {studentSkill.verificationStrength ===
                        "UNVERIFIED"
                          ? "○ Unverified"
                          : `✓ ${studentSkill.verificationStrength} verification`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Evidence */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-8">
          <h2 className="text-2xl font-semibold">
            Evidence
          </h2>

          <p className="text-sm text-[#9AA3C0] mt-1 mb-5">
            Work, certifications, projects and other
            proof of skills.
          </p>

          {candidate.evidence.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">
              <p className="text-[#9AA3C0]">
                No evidence submitted.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidate.evidence.map((evidence) => (
                <div
                  key={evidence.id}
                  className="rounded-xl border border-[#232B47] bg-[#0F1526]/40 p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                    <div>
                      <h3 className="font-semibold">
                        {evidence.title}
                      </h3>

                      <p className="text-xs text-[#9AA3C0] mt-1">
                        {evidence.skill?.name ||
                          "General"}{" "}
                        • {evidence.type}
                      </p>

                      {evidence.description && (
                        <p className="text-sm text-[#9AA3C0] mt-3">
                          {evidence.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className="text-xs"
                        style={{
                          color: evidence.verified
                            ? TEAL
                            : "#9AA3C0",
                        }}
                      >
                        {evidence.verified
                          ? "✓ Verified"
                          : "○ Unverified"}
                      </span>

                      {evidence.score !== null && (
                        <p className="text-xs text-[#9AA3C0] mt-2">
                          Score: {evidence.score}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className="rounded-full border border-[#232B47] px-3 py-1 text-xs text-[#9AA3C0]">
                      {formatDate(evidence.createdAt)}
                    </span>

                    {evidence.url && (
                      <a
                        href={evidence.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#F4A93B] hover:text-[#f6bd6a]"
                      >
                        View evidence →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assessments */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-8">
          <h2 className="text-2xl font-semibold">
            Assessments
          </h2>

          <p className="text-sm text-[#9AA3C0] mt-1 mb-5">
            Assessment performance.
          </p>

          {candidate.assessments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">
              <p className="text-[#9AA3C0]">
                No assessments available.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidate.assessments.map(
                (assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between rounded-xl border border-[#232B47] bg-[#0F1526]/40 p-5"
                  >
                    <div>
                      <h3 className="font-medium">
                        {assessment.title}
                      </h3>

                      <p className="text-xs text-[#9AA3C0] mt-1">
                        {formatDate(
                          assessment.createdAt
                        )}
                      </p>
                    </div>

                    <span className="text-xl font-bold text-[#F4A93B]">
                      {assessment.score}%
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Academic Credentials */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-8">
          <h2 className="text-2xl font-semibold">
            Academic Credentials
          </h2>

          <p className="text-sm text-[#9AA3C0] mt-1 mb-5">
            Academic and external credentials.
          </p>

          {candidate.academicCredentials.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">
              <p className="text-[#9AA3C0]">
                No academic credentials available.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidate.academicCredentials.map(
                (credential) => (
                  <div
                    key={credential.id}
                    className="rounded-xl border border-[#232B47] bg-[#0F1526]/40 p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                      <div>
                        <h3 className="font-semibold">
                          {credential.title}
                        </h3>

                        <p className="text-sm text-[#9AA3C0] mt-1">
                          {credential.source}
                          {credential.institution
                            ? ` • ${credential.institution}`
                            : ""}
                        </p>

                        {credential.credentialId && (
                          <p className="text-xs text-[#5B6488] mt-2">
                            ID:{" "}
                            {credential.credentialId}
                          </p>
                        )}
                      </div>

                      <span
                        className="text-xs"
                        style={{
                          color: credential.verified
                            ? TEAL
                            : "#9AA3C0",
                        }}
                      >
                        {credential.verified
                          ? "✓ Verified"
                          : "○ Unverified"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#9AA3C0]">
                      {credential.score !== null && (
                        <span>
                          Score: {credential.score}
                        </span>
                      )}

                      {credential.credits !== null && (
                        <span>
                          Credits: {credential.credits}
                        </span>
                      )}

                      {credential.issueDate && (
                        <span>
                          Issued:{" "}
                          {formatDate(
                            credential.issueDate
                          )}
                        </span>
                      )}

                      {credential.verificationUrl && (
                        <a
                          href={
                            credential.verificationUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#F4A93B] hover:text-[#f6bd6a]"
                        >
                          Verify credential →
                        </a>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Application History */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7">
          <h2 className="text-2xl font-semibold">
            Application History
          </h2>

          <p className="text-sm text-[#9AA3C0] mt-1 mb-5">
            Opportunities this student has applied to.
          </p>

          {candidate.applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">
              <p className="text-[#9AA3C0]">
                No applications yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidate.applications.map(
                (application) => {
                  const score =
                    application.matchScore !== null
                      ? Math.round(
                          application.matchScore
                        )
                      : null;

                  return (
                    <div
                      key={application.id}
                      className="rounded-xl border border-[#232B47] bg-[#0F1526]/40 p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                          <h3 className="font-semibold">
                            {
                              application.opportunity
                                .title
                            }
                          </h3>

                          <p className="text-sm text-[#F4A93B] mt-1">
                            {
                              application.opportunity
                                .company
                            }
                          </p>

                          <p className="text-xs text-[#9AA3C0] mt-2">
                            {
                              application.opportunity
                                .type
                            }{" "}
                            • Applied{" "}
                            {formatDate(
                              application.createdAt
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {score !== null && (
                            <span className="rounded-xl border border-[#F4A93B]/30 bg-[#F4A93B]/10 px-3 py-2 text-sm text-[#F4A93B]">
                              {score}% match
                            </span>
                          )}

                          <span className="rounded-full border border-[#232B47] bg-white/5 px-3 py-2 text-xs text-[#C7CCE0]">
                            {
                              application.status
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}