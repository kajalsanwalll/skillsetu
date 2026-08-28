
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

  /* ---------------------------------------------
     LOADING
  --------------------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08080c] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[130px]" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-10 w-96 rounded bg-white/10" />
            <div className="h-4 w-72 rounded bg-white/5" />

            <div className="h-64 rounded-3xl border border-white/[0.07] bg-white/[0.025]" />

            <div className="h-48 rounded-3xl border border-white/[0.07] bg-white/[0.025]" />
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------
     ERROR
  --------------------------------------------- */

  if (error || !opportunity) {
    return (
      <main className="min-h-screen bg-[#08080c] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/industry/opportunities"
              )
            }
            className="group mb-8 flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Back to Opportunities
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 text-red-300">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠</span>

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-300/80">
                  {error ||
                    "Opportunity not found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------
     MAIN PAGE
  --------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#08080c] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[450px] w-[450px] rounded-full bg-purple-600/[0.08] blur-[140px]" />

        <div className="absolute right-[-120px] top-[25%] h-[450px] w-[450px] rounded-full bg-indigo-600/[0.07] blur-[140px]" />

        <div className="absolute bottom-[-150px] left-[35%] h-[400px] w-[400px] rounded-full bg-purple-500/[0.04] blur-[130px]" />
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

        {/* -----------------------------------------
            OPPORTUNITY HEADER
        ----------------------------------------- */}

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm sm:p-8">

          {/* Card glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-purple-600/[0.07] blur-[90px]" />

          <div className="relative">

            {/* Meta */}
            <div className="mb-5 flex flex-wrap items-center gap-3">

              <span className="rounded-full border border-purple-500/20 bg-purple-500/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                {opportunity.type.replaceAll(
                  "_",
                  " "
                )}
              </span>

              {opportunity.location && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>📍</span>
                  {opportunity.location}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {opportunity.title}
            </h1>

            <p className="mt-2 text-base font-medium text-purple-300">
              {opportunity.company}
            </p>

            <p className="mt-5 max-w-4xl text-sm leading-7 text-gray-500 sm:text-base">
              {opportunity.description}
            </p>

            {/* Required skills */}
            <div className="mt-8 border-t border-white/[0.07] pt-7">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Required Skills
                  </h2>

                  <p className="mt-1 text-xs text-gray-600">
                    Skills required for this opportunity
                  </p>
                </div>

                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-gray-500">
                  {opportunity.skills.length} skills
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {opportunity.skills.map(
                  (skill) => (
                    <div
                      key={skill.id}
                      className={`
                        rounded-2xl
                        border
                        px-4
                        py-3
                        transition-all
                        duration-200
                        ${
                          skill.required
                            ? "border-purple-500/20 bg-purple-500/[0.08] hover:border-purple-500/30 hover:bg-purple-500/[0.12]"
                            : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-200">
                          {skill.name}
                        </p>

                        {skill.required && (
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-gray-600">
                        Minimum{" "}
                        {skill.minimumProficiency}%
                      </p>

                      {skill.required && (
                        <p className="mt-1 text-[11px] font-medium text-purple-400">
                          Required
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------
            APPLICANTS
        ----------------------------------------- */}

        <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm">

          {/* Section header */}
          <div className="flex flex-col gap-4 border-b border-white/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">
                  Applicants
                </h2>

                <span className="rounded-full border border-purple-500/20 bg-purple-500/[0.08] px-3 py-1 text-xs font-semibold text-purple-300">
                  {applicants.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Students who applied to this
                opportunity.
              </p>
            </div>

            {applicants.length > 0 && (
              <div className="text-xs text-gray-600">
                Ranked by application
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7">

            {applicantsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 rounded-2xl border border-white/[0.07] bg-white/[0.025]"
                  />
                ))}
              </div>
            ) : applicantsError ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5 text-red-300">
                <div className="flex gap-3">
                  <span>⚠</span>

                  <div>
                    <p className="font-medium">
                      Unable to load applicants
                    </p>

                    <p className="mt-1 text-sm text-red-300/70">
                      {applicantsError}
                    </p>
                  </div>
                </div>
              </div>
            ) : applicants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-14 text-center">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-2xl">
                  👥
                </div>

                <h3 className="text-lg font-semibold">
                  No applications yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                  Applicants will appear here when
                  students apply to this opportunity.
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
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-2xl
                          border
                          border-white/[0.07]
                          bg-black/20
                          p-5
                          transition-all
                          duration-200
                          hover:border-purple-500/20
                          hover:bg-white/[0.025]
                          sm:p-6
                        "
                      >

                        {/* Hover glow */}
                        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/[0.04] blur-3xl transition-all group-hover:bg-purple-500/[0.08]" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">

                          {/* Student */}
                          <div className="flex min-w-0 flex-1 items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-indigo-500/10 text-base font-bold text-purple-300">
                              {application.student.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-semibold">
                                {
                                  application.student
                                    .name
                                }
                              </h3>

                              <p className="truncate text-sm text-gray-500">
                                {
                                  application.student
                                    .email
                                }
                              </p>

                              {application.student
                                .careerInterest && (
                                <p className="mt-1 truncate text-xs text-gray-600">
                                  {
                                    application.student
                                      .careerInterest
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Match */}
                          <div className="flex shrink-0 items-center gap-3">

                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.08] px-5 py-3 text-center">

                              <p className="text-2xl font-bold tracking-tight text-purple-300">
                                {matchScore}%
                              </p>

                              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-600">
                                Skill Match
                              </p>
                            </div>

                            {/* Status */}
                            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                              {application.status.replaceAll(
                                "_",
                                " "
                              )}
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
                            className="
                              shrink-0
                              rounded-xl
                              bg-purple-600
                              px-5
                              py-3
                              text-sm
                              font-semibold
                              text-white
                              transition-all
                              hover:bg-purple-500
                              hover:shadow-lg
                              hover:shadow-purple-600/20
                            "
                          >
                            View Profile
                            <span className="ml-2">
                              →
                            </span>
                          </button>
                        </div>

                        {/* Skills */}
                        <div className="relative mt-5 border-t border-white/[0.06] pt-4">

                          <div className="flex flex-wrap gap-2">

                            {application.student.skills
                              .slice(0, 8)
                              .map((skill) => (
                                <span
                                  key={skill.id}
                                  className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-xs text-gray-400"
                                >
                                  {skill.name}

                                  <span className="ml-2 font-semibold text-purple-300">
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
          </div>
        </section>
      </div>

      {/* -------------------------------------------
          APPLICANT PROFILE MODAL
      ------------------------------------------- */}

      {selectedApplicant && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm sm:p-6">

          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/[0.09] bg-[#101014] shadow-2xl shadow-black/50">

            {/* Modal glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-600/[0.08] blur-[80px]" />

            {/* Modal header */}
            <div className="relative flex items-start justify-between border-b border-white/[0.07] p-6 sm:p-7">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-indigo-500/10 text-xl font-bold text-purple-300">
                  {selectedApplicant.student.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-400">
                    Student Profile
                  </p>

                  <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                    {
                      selectedApplicant.student
                        .name
                    }
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    {
                      selectedApplicant.student
                        .email
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedApplicant(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-xl text-gray-500 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="relative overflow-y-auto p-6 sm:p-7">

              {/* Match / Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/[0.07] p-5">

                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl" />

                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Skill Match
                  </p>

                  <p className="mt-1 text-3xl font-bold text-purple-300">
                    {Math.round(
                      selectedApplicant.matchScore ??
                        0
                    )}
                    %
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Application Status
                  </p>

                  <p className="mt-2 inline-flex rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-300">
                    {
                      selectedApplicant.status
                    }
                  </p>
                </div>
              </div>

              {/* Bio */}
              {selectedApplicant.student.bio && (
                <div className="mt-7">

                  <SectionHeading
                    title="About"
                    description="Student profile"
                  />

                  <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                    <p className="text-sm leading-7 text-gray-400">
                      {
                        selectedApplicant.student
                          .bio
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="mt-8">

                <SectionHeading
                  title="Skill DNA"
                  description={`${selectedApplicant.student.skills.length} verified capabilities`}
                />

                <div className="mt-4 grid gap-3 md:grid-cols-2">

                  {selectedApplicant.student.skills.map(
                    (skill) => (
                      <div
                        key={skill.id}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-purple-500/15"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="font-medium text-gray-200">
                              {skill.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {skill.category ||
                                "General"}
                            </p>
                          </div>

                          <span className="font-semibold text-purple-300">
                            {skill.proficiency}%
                          </span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-400"
                            style={{
                              width: `${Math.min(
                                skill.proficiency,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between">

                          <span className="text-[10px] uppercase tracking-wider text-gray-700">
                            Verification
                          </span>

                          <span className="text-xs text-gray-500">
                            {
                              skill.verificationStrength
                            }
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Evidence */}
              <div className="mt-8">

                <SectionHeading
                  title="Evidence"
                  description="Submitted skill evidence"
                />

                {selectedApplicant.student
                  .evidence.length === 0 ? (
                  <EmptySection text="No evidence submitted." />
                ) : (
                  <div className="mt-4 space-y-3">

                    {selectedApplicant.student.evidence.map(
                      (evidence) => (
                        <div
                          key={evidence.id}
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <p className="font-medium text-gray-200">
                                {evidence.title}
                              </p>

                              <p className="mt-1 text-xs text-gray-600">
                                {evidence.skill?.name ||
                                  "General"}{" "}
                                •{" "}
                                {evidence.type}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                                evidence.verified
                                  ? "border-green-500/20 bg-green-500/[0.07] text-green-400"
                                  : "border-white/[0.07] bg-white/[0.03] text-gray-600"
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
              <div className="mt-8">

                <SectionHeading
                  title="Assessments"
                  description="Assessment performance"
                />

                {selectedApplicant.student
                  .assessments.length === 0 ? (
                  <EmptySection text="No assessments." />
                ) : (
                  <div className="mt-4 space-y-3">

                    {selectedApplicant.student.assessments.map(
                      (assessment) => (
                        <div
                          key={assessment.id}
                          className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                        >

                          <span className="text-sm text-gray-300">
                            {assessment.title}
                          </span>

                          <span className="rounded-lg bg-purple-500/[0.08] px-3 py-1.5 text-sm font-semibold text-purple-300">
                            {assessment.score}%
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Academic credentials */}
              <div className="mt-8">

                <SectionHeading
                  title="Academic Credentials"
                  description="Academic and external credentials"
                />

                {selectedApplicant.student
                  .academicCredentials.length ===
                0 ? (
                  <EmptySection text="No academic credentials." />
                ) : (
                  <div className="mt-4 space-y-3">

                    {selectedApplicant.student.academicCredentials.map(
                      (credential) => (
                        <div
                          key={credential.id}
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <p className="font-medium text-gray-200">
                                {credential.title}
                              </p>

                              <p className="mt-1 text-xs text-gray-600">
                                {credential.source}
                                {credential.institution
                                  ? ` • ${credential.institution}`
                                  : ""}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                                credential.verified
                                  ? "border-green-500/20 bg-green-500/[0.07] text-green-400"
                                  : "border-white/[0.07] bg-white/[0.03] text-gray-600"
                              }`}
                            >
                              {credential.verified
                                ? "✓ Verified"
                                : "Unverified"}
                            </span>
                          </div>

                          {(credential.score !==
                            null ||
                            credential.credits !==
                              null) && (
                            <div className="mt-4 flex flex-wrap gap-2">

                              {credential.score !==
                                null && (
                                <span className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-gray-500">
                                  Score:{" "}
                                  <span className="text-gray-300">
                                    {
                                      credential.score
                                    }
                                  </span>
                                </span>
                              )}

                              {credential.credits !==
                                null && (
                                <span className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-gray-500">
                                  Credits:{" "}
                                  <span className="text-gray-300">
                                    {
                                      credential.credits
                                    }
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-white/[0.07] bg-black/20 p-5 sm:p-6">

              <button
                type="button"
                onClick={() =>
                  setSelectedApplicant(null)
                }
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------------------------------------------
   SMALL UI HELPERS
--------------------------------------------- */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-gray-200">
        {title}
      </h3>

      <p className="mt-1 text-xs text-gray-600">
        {description}
      </p>
    </div>
  );
}

function EmptySection({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.015] p-5 text-sm text-gray-600">
      {text}
    </div>
  );
}

