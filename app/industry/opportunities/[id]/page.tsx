"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Skill = {
  id: string;
  name: string;
  category: string | null;
  required: boolean;
  minimumProficiency: number;
  weight: number;
};

type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  type: string;
  createdAt: string;
  skills: Skill[];
};

type StudentSkill = {
  id: string;
  skillId: string;
  name: string;
  category: string | null;
  proficiency: number;
  verificationStrength: string;
};

type Evidence = {
  id: string;
  title: string;
  type: string;
  verified: boolean;
  verificationStrength: string;
  skill: {
    id: string;
    name: string;
  } | null;
};

type Assessment = {
  id: string;
  title: string;
  score: number;
};

type AcademicCredential = {
  id: string;
  source: string;
  title: string;
  institution: string | null;
  score: number | null;
  credits: number | null;
  verified: boolean;
  verificationStrength: string;
  issueDate: string | null;
  verificationUrl: string | null;
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
    careerInterest: string | null;
    bio: string | null;

    skills: StudentSkill[];
    evidence: Evidence[];
    assessments: Assessment[];
    academicCredentials: AcademicCredential[];
  };
};

export default function IndustryOpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] =
    useState<Opportunity | null>(null);

  const [applicants, setApplicants] = useState<
    Applicant[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [applicantsLoading, setApplicantsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [applicantsError, setApplicantsError] =
    useState("");

  const [selectedApplicant, setSelectedApplicant] =
    useState<Applicant | null>(null);

  useEffect(() => {
    if (!opportunityId) return;

    async function loadData() {
      try {
        // -----------------------------------------
        // Load opportunity
        // -----------------------------------------

        const opportunityResponse = await fetch(
          `/api/industry/opportunities/${opportunityId}`
        );

        const opportunityData =
          await opportunityResponse.json();

        if (!opportunityResponse.ok) {
          throw new Error(
            opportunityData.error ||
              "Failed to load opportunity."
          );
        }

        setOpportunity(
          opportunityData.opportunity
        );

        // -----------------------------------------
        // Load applicants
        // -----------------------------------------

        const applicantsResponse = await fetch(
          `/api/industry/opportunities/${opportunityId}/applications`
        );

        const applicantsData =
          await applicantsResponse.json();

        if (!applicantsResponse.ok) {
          throw new Error(
            applicantsData.error ||
              "Failed to load applicants."
          );
        }

        setApplicants(
          applicantsData.applicants || []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load opportunity."
        );
      } finally {
        setLoading(false);
        setApplicantsLoading(false);
      }
    }

    loadData();
  }, [opportunityId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400">
            Loading opportunity...
          </p>
        </div>
      </main>
    );
  }

  if (error || !opportunity) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error ||
              "Opportunity not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/industry/opportunities"
            )
          }
          className="mb-6 text-sm text-gray-400 hover:text-white transition"
        >
          ← Back to Opportunities
        </button>

        {/* Opportunity */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 mb-8">

          <div className="flex flex-col md:flex-row md:justify-between gap-6">

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3 mb-4">

                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                  {opportunity.type.replaceAll(
                    "_",
                    " "
                  )}
                </span>

                {opportunity.location && (
                  <span className="text-sm text-gray-500">
                    📍 {opportunity.location}
                  </span>
                )}

              </div>

              <h1 className="text-3xl font-bold">
                {opportunity.title}
              </h1>

              <p className="text-purple-300 mt-2">
                {opportunity.company}
              </p>

              <p className="text-gray-400 mt-5 leading-relaxed">
                {opportunity.description}
              </p>

            </div>

          </div>

          {/* Required skills */}

          <div className="mt-7 pt-6 border-t border-white/10">

            <h2 className="text-lg font-semibold mb-4">
              Required Skills
            </h2>

            <div className="flex flex-wrap gap-3">

              {opportunity.skills.map(
                (skill) => (
                  <div
                    key={skill.id}
                    className={`rounded-xl border px-4 py-3 ${
                      skill.required
                        ? "border-purple-500/20 bg-purple-500/10"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <p className="font-medium">
                      {skill.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Minimum:{" "}
                      {skill.minimumProficiency}%
                    </p>

                    {skill.required && (
                      <p className="text-xs text-purple-400 mt-1">
                        Required
                      </p>
                    )}
                  </div>
                )
              )}

            </div>

          </div>
        </section>

        {/* Applicants */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-2xl font-semibold">
                Applicants
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Students who applied to this
                opportunity.
              </p>
            </div>

            <div className="rounded-xl bg-purple-500/10 px-4 py-2">
              <span className="text-purple-300 font-semibold">
                {applicants.length}
              </span>

              <span className="text-gray-400 text-sm ml-1">
                applicants
              </span>
            </div>

          </div>

          {applicantsLoading ? (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-gray-400">
                Loading applicants...
              </p>
            </div>
          ) : applicantsError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
              {applicantsError}
            </div>
          ) : applicants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-gray-400">
                No applications yet.
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Applicants will appear here when
                students apply.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {applicants.map(
                (application) => {

                  const matchScore =
                    Math.round(
                      application.matchScore ?? 0
                    );

                  return (
                    <div
                      key={
                        application.applicationId
                      }
                      className="rounded-xl border border-white/10 bg-black/10 p-5"
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        {/* Student */}

                        <div className="flex-1">

                          <h3 className="text-lg font-semibold">
                            {
                              application.student
                                .name
                            }
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {
                              application.student
                                .email
                            }
                          </p>

                          {application.student
                            .careerInterest && (
                            <p className="text-sm text-gray-400 mt-2">
                              {
                                application.student
                                  .careerInterest
                              }
                            </p>
                          )}

                        </div>

                        {/* Match */}

                        <div className="shrink-0 text-center">

                          <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-5 py-3">

                            <p className="text-2xl font-bold text-purple-300">
                              {matchScore}%
                            </p>

                            <p className="text-xs text-gray-500">
                              Skill Match
                            </p>

                          </div>

                        </div>

                        {/* Status */}

                        <div className="shrink-0">

                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                            {application.status}
                          </span>

                        </div>

                        {/* View */}

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedApplicant(
                              application
                            )
                          }
                          className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold hover:bg-purple-500 transition"
                        >
                          View Profile
                        </button>

                      </div>

                      {/* Top skills */}

                      <div className="mt-5 pt-4 border-t border-white/10">

                        <p className="text-xs text-gray-500 mb-2">
                          Skills
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {application.student.skills
                            .slice(0, 8)
                            .map((skill) => (
                              <span
                                key={skill.id}
                                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-gray-300"
                              >
                                {skill.name}{" "}
                                <span className="text-purple-400">
                                  {
                                    skill.proficiency
                                  }
                                  %
                                </span>
                              </span>
                            ))}

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

      {/* Applicant Profile Modal */}

      {selectedApplicant && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111116] p-7 shadow-2xl">

            {/* Header */}

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-purple-400">
                  STUDENT PROFILE
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  {
                    selectedApplicant.student
                      .name
                  }
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {
                    selectedApplicant.student
                      .email
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedApplicant(null)
                }
                className="text-2xl text-gray-500 hover:text-white"
              >
                ×
              </button>

            </div>

            {/* Match + Status */}

            <div className="grid grid-cols-2 gap-4 mt-6">

              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">

                <p className="text-xs text-gray-500">
                  Skill Match
                </p>

                <p className="text-2xl font-bold text-purple-300 mt-1">
                  {Math.round(
                    selectedApplicant.matchScore ??
                      0
                  )}
                  %
                </p>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                <p className="text-xs text-gray-500">
                  Application Status
                </p>

                <p className="text-lg font-semibold mt-1">
                  {
                    selectedApplicant.status
                  }
                </p>

              </div>

            </div>

            {/* Bio */}

            {selectedApplicant.student.bio && (
              <div className="mt-6">

                <h3 className="font-semibold">
                  About
                </h3>

                <p className="text-gray-400 mt-2 leading-relaxed">
                  {
                    selectedApplicant.student
                      .bio
                  }
                </p>

              </div>
            )}

            {/* Skills */}

            <div className="mt-7">

              <h3 className="font-semibold">
                Skill DNA
              </h3>

              <div className="grid md:grid-cols-2 gap-3 mt-3">

                {selectedApplicant.student.skills.map(
                  (skill) => (
                    <div
                      key={skill.id}
                      className="rounded-xl border border-white/10 p-4"
                    >

                      <div className="flex justify-between">

                        <div>
                          <p className="font-medium">
                            {skill.name}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {skill.category ||
                              "General"}
                          </p>
                        </div>

                        <span className="text-purple-300 font-semibold">
                          {skill.proficiency}%
                        </span>

                      </div>

                      <div className="h-1.5 rounded-full bg-white/10 mt-3 overflow-hidden">

                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              skill.proficiency,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Verification:{" "}
                        {
                          skill.verificationStrength
                        }
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* Evidence */}

            <div className="mt-7">

              <h3 className="font-semibold">
                Evidence
              </h3>

              {selectedApplicant.student
                .evidence.length === 0 ? (
                <p className="text-sm text-gray-500 mt-3">
                  No evidence submitted.
                </p>
              ) : (
                <div className="space-y-2 mt-3">

                  {selectedApplicant.student.evidence.map(
                    (evidence) => (
                      <div
                        key={evidence.id}
                        className="rounded-xl border border-white/10 p-4"
                      >

                        <div className="flex justify-between gap-4">

                          <div>

                            <p className="font-medium">
                              {evidence.title}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {evidence.skill?.name ||
                                "General"}{" "}
                              •{" "}
                              {evidence.type}
                            </p>

                          </div>

                          <span
                            className={`text-xs ${
                              evidence.verified
                                ? "text-green-400"
                                : "text-gray-500"
                            }`}
                          >
                            {evidence.verified
                              ? "✓ Verified"
                              : "Unverified"}
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Assessments */}

            <div className="mt-7">

              <h3 className="font-semibold">
                Assessments
              </h3>

              {selectedApplicant.student
                .assessments.length === 0 ? (
                <p className="text-sm text-gray-500 mt-3">
                  No assessments.
                </p>
              ) : (
                <div className="space-y-2 mt-3">

                  {selectedApplicant.student.assessments.map(
                    (assessment) => (
                      <div
                        key={assessment.id}
                        className="flex justify-between rounded-xl border border-white/10 p-4"
                      >

                        <span>
                          {assessment.title}
                        </span>

                        <span className="text-purple-300 font-semibold">
                          {assessment.score}%
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Academic / NPTEL */}

            <div className="mt-7">

              <h3 className="font-semibold">
                Academic Credentials
              </h3>

              {selectedApplicant.student
                .academicCredentials.length ===
              0 ? (
                <p className="text-sm text-gray-500 mt-3">
                  No academic credentials.
                </p>
              ) : (
                <div className="space-y-2 mt-3">

                  {selectedApplicant.student.academicCredentials.map(
                    (credential) => (
                      <div
                        key={credential.id}
                        className="rounded-xl border border-white/10 p-4"
                      >

                        <div className="flex justify-between gap-4">

                          <div>

                            <p className="font-medium">
                              {credential.title}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {credential.source}
                              {credential.institution
                                ? ` • ${credential.institution}`
                                : ""}
                            </p>

                          </div>

                          <span
                            className={`text-xs ${
                              credential.verified
                                ? "text-green-400"
                                : "text-gray-500"
                            }`}
                          >
                            {credential.verified
                              ? "✓ Verified"
                              : "Unverified"}
                          </span>

                        </div>

                        <div className="flex gap-4 mt-3 text-xs text-gray-400">

                          {credential.score !==
                            null && (
                            <span>
                              Score:{" "}
                              {
                                credential.score
                              }
                            </span>
                          )}

                          {credential.credits !==
                            null && (
                            <span>
                              Credits:{" "}
                              {
                                credential.credits
                              }
                            </span>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Close */}

            <div className="mt-7 pt-5 border-t border-white/10">

              <button
                type="button"
                onClick={() =>
                  setSelectedApplicant(null)
                }
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}
    </main>
  );
}