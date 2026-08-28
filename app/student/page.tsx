
"use client";

import { useEffect, useState } from "react";

type Skill = {
  id: string;
  name: string;
  category: string | null;
};

type StudentSkill = {
  id: string;
  proficiency: number;
  verificationStrength: string;
  skill: Skill;
};

type Evidence = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  url: string | null;
  score: number | null;
  verified: boolean;
  verificationStrength: string;
  skill: Skill;
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

type Assessment = {
  id: string;
  title: string;
  score: number;
};

type StudentProfile = {
  id: string;
  careerInterest: string | null;
  bio: string | null;
  skills: StudentSkill[];
  evidence: Evidence[];
  assessments: Assessment[];
  academicCredentials?: AcademicCredential[];
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10";

const selectClass =
  "w-full rounded-xl border border-white/10 bg-[#15151c] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10";

const primaryButtonClass =
  "rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50";

const sectionClass =
  "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-xl shadow-black/10";

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // ADD SKILL
  // =========================

  const [showAddSkill, setShowAddSkill] =
    useState(false);

  const [skillName, setSkillName] =
    useState("");

  const [proficiency, setProficiency] =
    useState(50);

  const [savingSkill, setSavingSkill] =
    useState(false);

  const [skillError, setSkillError] =
    useState("");

  // =========================
  // EVIDENCE
  // =========================

  const [showEvidenceModal, setShowEvidenceModal] =
    useState(false);

  const [evidence, setEvidence] =
    useState<Evidence[]>([]);

  const [selectedSkillId, setSelectedSkillId] =
    useState("");

  const [evidenceType, setEvidenceType] =
    useState("PROJECT");

  const [evidenceTitle, setEvidenceTitle] =
    useState("");

  const [evidenceDescription, setEvidenceDescription] =
    useState("");

  const [evidenceUrl, setEvidenceUrl] =
    useState("");

  const [evidenceScore, setEvidenceScore] =
    useState("");

  const [savingEvidence, setSavingEvidence] =
    useState(false);

  const [evidenceError, setEvidenceError] =
    useState("");

  // =========================
  // ACADEMIC CREDENTIALS
  // =========================

  const [showCredentialModal, setShowCredentialModal] =
    useState(false);

  const [credentials, setCredentials] =
    useState<AcademicCredential[]>([]);

  const [credentialSource, setCredentialSource] =
    useState("NPTEL");

  const [credentialId, setCredentialId] =
    useState("");

  const [credentialTitle, setCredentialTitle] =
    useState("");

  const [credentialInstitution, setCredentialInstitution] =
    useState("");

  const [credentialScore, setCredentialScore] =
    useState("");

  const [credentialCredits, setCredentialCredits] =
    useState("");

  const [credentialDate, setCredentialDate] =
    useState("");

  const [credentialUrl, setCredentialUrl] =
    useState("");

  const [savingCredential, setSavingCredential] =
    useState(false);

  const [credentialError, setCredentialError] =
    useState("");

  // =========================
  // LOAD PROFILE
  // =========================

  async function loadProfile() {
    try {
      const response = await fetch(
        "/api/student/profile"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load student profile."
        );
      }

      setUser(data.user);
      setProfile(data.profile);

      setEvidence(
        data.profile?.evidence || []
      );

      setCredentials(
        data.profile?.academicCredentials || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load student profile."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // =========================
  // LOAD EVIDENCE
  // =========================

  async function loadEvidence() {
    try {
      const response = await fetch(
        "/api/student/evidence"
      );

      const data = await response.json();

      if (response.ok) {
        setEvidence(
          data.evidence || []
        );
      }
    } catch (error) {
      console.error(
        "Failed to load evidence:",
        error
      );
    }
  }

  // =========================
  // LOAD CREDENTIALS
  // =========================

  async function loadCredentials() {
    try {
      const response = await fetch(
        "/api/student/credentials"
      );

      const data = await response.json();

      if (response.ok) {
        setCredentials(
          data.credentials || []
        );
      }
    } catch (error) {
      console.error(
        "Failed to load credentials:",
        error
      );
    }
  }

  // =========================
  // ADD SKILL
  // =========================

  async function handleAddSkill() {
    setSkillError("");
    setSavingSkill(true);

    try {
      const response = await fetch(
        "/api/student/skills",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skillName,
            proficiency,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to add skill."
        );
      }

      await loadProfile();

      setSkillName("");
      setProficiency(50);
      setShowAddSkill(false);
    } catch (error) {
      setSkillError(
        error instanceof Error
          ? error.message
          : "Failed to add skill."
      );
    } finally {
      setSavingSkill(false);
    }
  }

  // =========================
  // ADD EVIDENCE
  // =========================

  async function handleAddEvidence() {
    setEvidenceError("");
    setSavingEvidence(true);

    try {
      if (!selectedSkillId) {
        throw new Error(
          "Please select a skill."
        );
      }

      if (!evidenceTitle.trim()) {
        throw new Error(
          "Please enter an evidence title."
        );
      }

      const response = await fetch(
        "/api/student/evidence",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skillId: selectedSkillId,
            type: evidenceType,
            title: evidenceTitle.trim(),
            description:
              evidenceDescription.trim() ||
              null,
            url:
              evidenceUrl.trim() ||
              null,
            score:
              evidenceScore.trim()
                ? Number(evidenceScore)
                : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to add evidence."
        );
      }

      await loadProfile();
      await loadEvidence();

      setSelectedSkillId("");
      setEvidenceType("PROJECT");
      setEvidenceTitle("");
      setEvidenceDescription("");
      setEvidenceUrl("");
      setEvidenceScore("");

      setShowEvidenceModal(false);
    } catch (error) {
      setEvidenceError(
        error instanceof Error
          ? error.message
          : "Failed to add evidence."
      );
    } finally {
      setSavingEvidence(false);
    }
  }

  // =========================
  // ADD ACADEMIC CREDENTIAL
  // =========================

  async function handleAddCredential() {
    setCredentialError("");
    setSavingCredential(true);

    try {
      if (!credentialTitle.trim()) {
        throw new Error(
          "Please enter the credential title."
        );
      }

      const response = await fetch(
        "/api/student/credentials",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: credentialSource,
            credentialId:
              credentialId.trim() || null,
            title: credentialTitle.trim(),
            institution:
              credentialInstitution.trim() ||
              null,
            score:
              credentialScore.trim()
                ? Number(credentialScore)
                : null,
            credits:
              credentialCredits.trim()
                ? Number(credentialCredits)
                : null,
            issueDate:
              credentialDate || null,
            verificationUrl:
              credentialUrl.trim() ||
              null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to add credential."
        );
      }

      await loadProfile();
      await loadCredentials();

      setCredentialSource("NPTEL");
      setCredentialId("");
      setCredentialTitle("");
      setCredentialInstitution("");
      setCredentialScore("");
      setCredentialCredits("");
      setCredentialDate("");
      setCredentialUrl("");

      setShowCredentialModal(false);
    } catch (error) {
      setCredentialError(
        error instanceof Error
          ? error.message
          : "Failed to add credential."
      );
    } finally {
      setSavingCredential(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

        <Background />

        <div className="relative mx-auto max-w-6xl">

          <div className="mb-10">
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />

            <div className="mt-5 h-12 w-80 max-w-full animate-pulse rounded-xl bg-white/10" />

            <div className="mt-4 h-5 w-[500px] max-w-full animate-pulse rounded bg-white/[0.06]" />
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.025]"
              />
            ))}
          </div>

          <div className="mt-8 h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.025]" />

        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !profile || !user) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

        <Background />

        <div className="relative mx-auto max-w-6xl">

          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-200">
                  Student profile unavailable
                </h2>

                <p className="mt-2 text-sm text-red-300/70">
                  {error ||
                    "Student profile unavailable."}
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>
    );
  }

  const averageSkill =
    profile.skills.length > 0
      ? Math.round(
          profile.skills.reduce(
            (sum, skill) =>
              sum + skill.proficiency,
            0
          ) / profile.skills.length
        )
      : 0;

  const verifiedSkills =
    profile.skills.filter(
      (skill) =>
        skill.verificationStrength
          ?.toLowerCase()
          .includes("verif")
    ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

      <Background />

      <div className="relative mx-auto max-w-6xl">

        {/* =========================================
            HEADER
        ========================================= */}

        <section className="mb-9">

          <div className="mb-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold shadow-lg shadow-indigo-500/20">
                S
              </div>

              <div>
                <p className="text-sm font-semibold tracking-tight">
                  SkillSetu
                </p>

                <p className="text-[10px] uppercase tracking-widest text-gray-600">
                  Student Profile
                </p>
              </div>

            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-gray-500 sm:block">
              Your Skill DNA
            </div>

          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 sm:p-9">

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/[0.10] blur-[90px]" />

            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-purple-500/[0.07] blur-[90px]" />

            <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-3xl font-bold text-indigo-300 ring-1 ring-indigo-400/20">
                  {user.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-500/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                    Student
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Welcome, {user.name}
                  </h1>

                  <p className="mt-2 text-sm text-gray-500">
                    Build your Skill DNA and turn your abilities into opportunities.
                  </p>

                </div>

              </div>

              <div className="shrink-0">

                <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-5 text-center">

                  <p className="text-[10px] uppercase tracking-widest text-gray-600">
                    Skill Readiness
                  </p>

                  <p className="mt-1 text-4xl font-bold text-white">
                    {averageSkill}%
                  </p>

                  <div className="mt-3 h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.07]">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{
                        width: `${averageSkill}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            STATS
        ========================================= */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon="✦"
            label="Skills"
            value={profile.skills.length}
            description="Capabilities in your DNA"
          />

          <StatCard
            icon="◈"
            label="Evidence"
            value={profile.evidence.length}
            description="Proof of your abilities"
          />

          <StatCard
            icon="◆"
            label="Credentials"
            value={credentials.length}
            description="Academic achievements"
          />

          <StatCard
            icon="◎"
            label="Assessments"
            value={profile.assessments.length}
            description="Performance records"
          />

        </section>

        {/* =========================================
            CAREER PROFILE
        ========================================= */}

        <section className={`${sectionClass} mb-6 p-6 sm:p-7`}>

          <SectionHeader
            icon="◎"
            eyebrow="PROFILE"
            title="Career Profile"
            description="Your current career direction and personal profile."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-2">

            <InfoCard
              label="Career interest"
              value={
                profile.careerInterest ||
                "Not set yet"
              }
              icon="↗"
            />

            <InfoCard
              label="About you"
              value={
                profile.bio ||
                "Tell SkillSetu about yourself."
              }
              icon="✎"
              multiline
            />

          </div>

        </section>

        {/* =========================================
            SKILL DNA
        ========================================= */}

        <section className={`${sectionClass} mb-6 p-6 sm:p-7`}>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

            <SectionHeader
              icon="✦"
              eyebrow="CAPABILITY PROFILE"
              title="Your Skill DNA"
              description="A live view of the capabilities you have built."
            />

            <button
              type="button"
              onClick={() => {
                setSkillError("");
                setShowAddSkill(true);
              }}
              className={primaryButtonClass}
            >
              + Add Skill
            </button>

          </div>

          <div className="mt-7">

            {profile.skills.length === 0 ? (

              <EmptyState
                icon="✦"
                title="No skills added yet"
                description="Start building your Skill DNA by adding your first skill."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setSkillError("");
                      setShowAddSkill(true);
                    }}
                    className={primaryButtonClass}
                  >
                    Add Your First Skill
                  </button>
                }
              />

            ) : (

              <div className="grid gap-4 md:grid-cols-2">

                {profile.skills.map(
                  (studentSkill) => {

                    const percentage =
                      Math.min(
                        Math.max(
                          studentSkill.proficiency,
                          0
                        ),
                        100
                      );

                    return (
                      <div
                        key={studentSkill.id}
                        className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:bg-white/[0.035]"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/[0.08] text-indigo-300">
                              ✦
                            </div>

                            <div>

                              <h3 className="font-semibold text-gray-100">
                                {studentSkill.skill.name}
                              </h3>

                              <p className="mt-0.5 text-xs text-gray-600">
                                {studentSkill.skill.category ||
                                  "General"}
                              </p>

                            </div>

                          </div>

                          <span className="text-lg font-bold text-indigo-300">
                            {studentSkill.proficiency}%
                          </span>

                        </div>

                        <div className="mt-5">

                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">

                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <div className="mt-2 flex justify-between">

                            <span className="text-[10px] text-gray-700">
                              Proficiency
                            </span>

                            <span className="text-[10px] text-gray-600">
                              {percentage >= 75
                                ? "Strong"
                                : percentage >= 50
                                ? "Developing"
                                : "Building"}
                            </span>

                          </div>

                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">

                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-300">
                            ✓
                          </span>

                          <span className="text-xs text-gray-600">
                            Verification:{" "}
                            <span className="text-gray-400">
                              {studentSkill.verificationStrength}
                            </span>
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>

        {/* =========================================
            EVIDENCE
        ========================================= */}

        <section className={`${sectionClass} mb-6 p-6 sm:p-7`}>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

            <SectionHeader
              icon="◈"
              eyebrow="PROOF OF WORK"
              title="Evidence"
              description="Projects, certifications, internships and assessments supporting your skills."
            />

            <button
              type="button"
              onClick={() => {
                setEvidenceError("");
                setShowEvidenceModal(true);
              }}
              className={primaryButtonClass}
            >
              + Add Evidence
            </button>

          </div>

          <div className="mt-7">

            {profile.evidence.length === 0 ? (

              <EmptyState
                icon="◈"
                title="No evidence added yet"
                description="Add projects, certifications, internships or assessments to strengthen your Skill DNA."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceError("");
                      setShowEvidenceModal(true);
                    }}
                    className={primaryButtonClass}
                  >
                    Add Evidence
                  </button>
                }
              />

            ) : (

              <div className="grid gap-4 md:grid-cols-2">

                {profile.evidence.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/20 hover:bg-white/[0.035]"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/[0.08] text-purple-300">
                            ◈
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-gray-100">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {item.skill.name}{" "}
                              <span className="mx-1">
                                •
                              </span>{" "}
                              {item.type}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                            item.verified
                              ? "border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-300"
                              : "border-white/10 bg-white/[0.03] text-gray-500"
                          }`}
                        >
                          {item.verified
                            ? "✓ Verified"
                            : item.verificationStrength}
                        </span>

                      </div>

                      {item.description && (
                        <p className="mt-4 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-3">

                        {item.score !== null &&
                          item.score !==
                            undefined && (
                            <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2">

                              <p className="text-[9px] uppercase tracking-wider text-gray-600">
                                Score
                              </p>

                              <p className="mt-0.5 text-sm font-semibold text-white">
                                {item.score}
                              </p>

                            </div>
                          )}

                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-indigo-500/10 bg-indigo-500/[0.05] px-3.5 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/[0.10]"
                          >
                            View Evidence →
                          </a>
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* =========================================
            CREDENTIALS
        ========================================= */}

        <section className={`${sectionClass} mb-6 p-6 sm:p-7`}>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

            <SectionHeader
              icon="◆"
              eyebrow="ACADEMIC ACHIEVEMENTS"
              title="Academic Credentials"
              description="NPTEL and other recognized academic achievements."
            />

            <button
              type="button"
              onClick={() => {
                setCredentialError("");
                setShowCredentialModal(true);
              }}
              className={primaryButtonClass}
            >
              + Add Credential
            </button>

          </div>

          <div className="mt-7">

            {credentials.length === 0 ? (

              <EmptyState
                icon="◆"
                title="No academic credentials yet"
                description="Add your NPTEL certifications and academic achievements."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setCredentialError("");
                      setShowCredentialModal(true);
                    }}
                    className={primaryButtonClass}
                  >
                    Add Credential
                  </button>
                }
              />

            ) : (

              <div className="grid gap-4 md:grid-cols-2">

                {credentials.map(
                  (credential) => (

                    <div
                      key={credential.id}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:bg-white/[0.035]"
                    >

                      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/[0.06] blur-2xl" />

                      <div className="relative">

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <span className="rounded-full border border-indigo-500/10 bg-indigo-500/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                              {credential.source}
                            </span>

                            <h3 className="mt-4 text-lg font-semibold text-gray-100">
                              {credential.title}
                            </h3>

                            {credential.institution && (
                              <p className="mt-1 text-sm text-gray-500">
                                {credential.institution}
                              </p>
                            )}

                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] ${
                              credential.verified
                                ? "border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-300"
                                : "border-white/10 bg-white/[0.03] text-gray-500"
                            }`}
                          >
                            {credential.verified
                              ? "✓ Verified"
                              : credential.verificationStrength}
                          </span>

                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          {credential.score !==
                            null &&
                            credential.score !==
                              undefined && (
                              <div className="rounded-xl border border-white/10 bg-black/10 p-3">

                                <p className="text-[9px] uppercase tracking-wider text-gray-600">
                                  Score
                                </p>

                                <p className="mt-1 text-lg font-bold text-white">
                                  {credential.score}%
                                </p>

                              </div>
                            )}

                          {credential.credits !==
                            null &&
                            credential.credits !==
                              undefined && (
                              <div className="rounded-xl border border-white/10 bg-black/10 p-3">

                                <p className="text-[9px] uppercase tracking-wider text-gray-600">
                                  Credits
                                </p>

                                <p className="mt-1 text-lg font-bold text-white">
                                  {credential.credits}
                                </p>

                              </div>
                            )}

                        </div>

                        {credential.credentialId && (
                          <p className="mt-4 text-xs text-gray-600">
                            Credential ID:{" "}
                            <span className="text-gray-400">
                              {credential.credentialId}
                            </span>
                          </p>
                        )}

                        {credential.issueDate && (
                          <p className="mt-2 text-xs text-gray-600">
                            Issued:{" "}
                            <span className="text-gray-400">
                              {new Date(
                                credential.issueDate
                              ).toLocaleDateString()}
                            </span>
                          </p>
                        )}

                        {credential.verificationUrl && (
                          <a
                            href={
                              credential.verificationUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
                          >
                            Verify Credential
                            <span>→</span>
                          </a>
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* =========================================
            ASSESSMENTS
        ========================================= */}

        <section className={`${sectionClass} p-6 sm:p-7`}>

          <SectionHeader
            icon="◎"
            eyebrow="PERFORMANCE"
            title="Assessments"
            description="Your assessment performance."
          />

          <div className="mt-7">

            {profile.assessments.length === 0 ? (

              <EmptyState
                icon="◎"
                title="No assessments yet"
                description="Your assessment results will appear here."
              />

            ) : (

              <div className="space-y-3">

                {profile.assessments.map(
                  (assessment) => {

                    const score = Math.min(
                      Math.max(
                        assessment.score,
                        0
                      ),
                      100
                    );

                    return (
                      <div
                        key={assessment.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-indigo-500/15"
                      >

                        <div className="flex items-center justify-between gap-5">

                          <div className="min-w-0">

                            <p className="font-medium text-gray-200">
                              {assessment.title}
                            </p>

                            <div className="mt-3 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-white/[0.06]">

                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{
                                  width: `${score}%`,
                                }}
                              />

                            </div>

                          </div>

                          <div className="shrink-0 text-right">

                            <p className="text-2xl font-bold text-indigo-300">
                              {assessment.score}%
                            </p>

                            <p className="text-[10px] text-gray-600">
                              Score
                            </p>

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

        {/* FOOTER */}

        <div className="py-8 text-center">

          <p className="text-xs text-gray-700">
            SkillSetu · Build your skills. Prove your capabilities. Find your opportunities.
          </p>

        </div>

      </div>

      {/* =========================================
          ADD SKILL MODAL
      ========================================= */}

      {showAddSkill && (
        <ModalShell
          onClose={() =>
            setShowAddSkill(false)
          }
        >

          <ModalHeader
            icon="✦"
            title="Add a Skill"
            description="Tell SkillSetu what you are good at."
            onClose={() =>
              setShowAddSkill(false)
            }
          />

          <div className="mt-7 space-y-6">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Skill name
              </label>

              <input
                type="text"
                value={skillName}
                onChange={(e) =>
                  setSkillName(e.target.value)
                }
                placeholder="e.g. Python, React, Data Analysis"
                className={inputClass}
              />
            </div>

            <div>

              <div className="mb-3 flex items-center justify-between">

                <label className="text-sm font-medium text-gray-300">
                  Proficiency
                </label>

                <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-sm font-semibold text-indigo-300">
                  {proficiency}%
                </span>

              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={proficiency}
                onChange={(e) =>
                  setProficiency(
                    Number(e.target.value)
                  )
                }
                className="w-full accent-indigo-500"
              />

              <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-gray-700">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
              </div>

            </div>

            {skillError && (
              <ErrorBox>
                {skillError}
              </ErrorBox>
            )}

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  setShowAddSkill(false)
                }
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddSkill}
                disabled={
                  savingSkill ||
                  !skillName.trim()
                }
                className={`flex-1 ${primaryButtonClass}`}
              >
                {savingSkill
                  ? "Adding..."
                  : "Add Skill"}
              </button>

            </div>

          </div>

        </ModalShell>
      )}

      {/* =========================================
          ADD EVIDENCE MODAL
      ========================================= */}

      {showEvidenceModal && (
        <ModalShell
          onClose={() =>
            setShowEvidenceModal(false)
          }
        >

          <ModalHeader
            icon="◈"
            title="Add Evidence"
            description="Add proof supporting one of your skills."
            onClose={() =>
              setShowEvidenceModal(false)
            }
          />

          <div className="mt-7 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Skill
              </label>

              <select
                value={selectedSkillId}
                onChange={(e) =>
                  setSelectedSkillId(
                    e.target.value
                  )
                }
                className={selectClass}
              >
                <option value="">
                  Select a skill
                </option>

                {profile.skills.map(
                  (studentSkill) => (
                    <option
                      key={
                        studentSkill.skill.id
                      }
                      value={
                        studentSkill.skill.id
                      }
                    >
                      {studentSkill.skill.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Evidence Type
              </label>

              <select
                value={evidenceType}
                onChange={(e) =>
                  setEvidenceType(
                    e.target.value
                  )
                }
                className={selectClass}
              >
                <option value="PROJECT">
                  Project
                </option>

                <option value="CERTIFICATION">
                  Certification
                </option>

                <option value="INTERNSHIP">
                  Internship
                </option>

                <option value="ASSESSMENT">
                  Assessment
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Evidence Title
              </label>

              <input
                type="text"
                value={evidenceTitle}
                onChange={(e) =>
                  setEvidenceTitle(
                    e.target.value
                  )
                }
                placeholder="e.g. Full-stack internship"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Description
              </label>

              <textarea
                value={evidenceDescription}
                onChange={(e) =>
                  setEvidenceDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the work or achievement..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Evidence URL
              </label>

              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) =>
                  setEvidenceUrl(
                    e.target.value
                  )
                }
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Score
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={evidenceScore}
                onChange={(e) =>
                  setEvidenceScore(
                    e.target.value
                  )
                }
                placeholder="85"
                className={inputClass}
              />
            </div>

            {evidenceError && (
              <ErrorBox>
                {evidenceError}
              </ErrorBox>
            )}

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  setShowEvidenceModal(false)
                }
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleAddEvidence
                }
                disabled={
                  savingEvidence ||
                  !selectedSkillId ||
                  !evidenceTitle.trim()
                }
                className={`flex-1 ${primaryButtonClass}`}
              >
                {savingEvidence
                  ? "Adding..."
                  : "Add Evidence"}
              </button>

            </div>

          </div>

        </ModalShell>
      )}

      {/* =========================================
          ADD CREDENTIAL MODAL
      ========================================= */}

      {showCredentialModal && (
        <ModalShell
          onClose={() =>
            setShowCredentialModal(false)
          }
        >

          <ModalHeader
            icon="◆"
            title="Add Academic Credential"
            description="Add an NPTEL certification or academic achievement."
            onClose={() =>
              setShowCredentialModal(false)
            }
          />

          <div className="mt-7 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Source
              </label>

              <select
                value={credentialSource}
                onChange={(e) =>
                  setCredentialSource(
                    e.target.value
                  )
                }
                className={selectClass}
              >
                <option value="NPTEL">
                  NPTEL
                </option>

                <option value="ACADEMIC_CREDENTIAL">
                  Academic Credential
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Course / Credential Title
              </label>

              <input
                type="text"
                value={credentialTitle}
                onChange={(e) =>
                  setCredentialTitle(
                    e.target.value
                  )
                }
                placeholder="e.g. Programming in Java"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Credential ID
              </label>

              <input
                type="text"
                value={credentialId}
                onChange={(e) =>
                  setCredentialId(
                    e.target.value
                  )
                }
                placeholder="Optional"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Institution
              </label>

              <input
                type="text"
                value={credentialInstitution}
                onChange={(e) =>
                  setCredentialInstitution(
                    e.target.value
                  )
                }
                placeholder="e.g. IIT Madras"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Score (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={credentialScore}
                  onChange={(e) =>
                    setCredentialScore(
                      e.target.value
                    )
                  }
                  placeholder="82"
                  className={inputClass}
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Credits
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={credentialCredits}
                  onChange={(e) =>
                    setCredentialCredits(
                      e.target.value
                    )
                  }
                  placeholder="3"
                  className={inputClass}
                />

              </div>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Issue Date
              </label>

              <input
                type="date"
                value={credentialDate}
                onChange={(e) =>
                  setCredentialDate(
                    e.target.value
                  )
                }
                className={inputClass}
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Verification URL
              </label>

              <input
                type="url"
                value={credentialUrl}
                onChange={(e) =>
                  setCredentialUrl(
                    e.target.value
                  )
                }
                placeholder="https://..."
                className={inputClass}
              />

            </div>

            {credentialError && (
              <ErrorBox>
                {credentialError}
              </ErrorBox>
            )}

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  setShowCredentialModal(false)
                }
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleAddCredential
                }
                disabled={
                  savingCredential ||
                  !credentialTitle.trim()
                }
                className={`flex-1 ${primaryButtonClass}`}
              >
                {savingCredential
                  ? "Adding..."
                  : "Add Credential"}
              </button>

            </div>

          </div>

        </ModalShell>
      )}

    </main>
  );
}

/* =================================================
   BACKGROUND
================================================= */

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />

      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/[0.025] blur-[120px]" />

      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

    </div>
  );
}

/* =================================================
   STAT CARD
================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/20 hover:bg-white/[0.035]">

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/[0.08] text-indigo-300">
          {icon}
        </div>

        <span className="text-[10px] uppercase tracking-widest text-gray-700">
          SkillSetu
        </span>

      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-gray-600">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-700">
        {description}
      </p>

    </div>
  );
}

/* =================================================
   SECTION HEADER
================================================= */

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/[0.07] text-indigo-300">
        {icon}
      </div>

      <div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400/70">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =================================================
   INFO CARD
================================================= */

function InfoCard({
  label,
  value,
  icon,
  multiline = false,
}: {
  label: string;
  value: string;
  icon: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">

      <div className="flex items-center gap-2">

        <span className="text-indigo-400">
          {icon}
        </span>

        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          {label}
        </p>

      </div>

      <p
        className={`mt-3 text-sm leading-7 text-gray-300 ${
          multiline ? "min-h-14" : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* =================================================
   EMPTY STATE
================================================= */

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.06] text-xl text-indigo-300">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold text-gray-200">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}

    </div>
  );
}

/* =================================================
   ERROR BOX
================================================= */

function ErrorBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3.5 text-sm text-red-300">

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
        !
      </span>

      <span>{children}</span>

    </div>
  );
}

/* =================================================
   MODAL SHELL
================================================= */

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#101117] p-6 shadow-2xl shadow-black/50 sm:p-7">

        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/[0.08] blur-3xl" />

        <div className="relative">
          {children}
        </div>

      </div>

    </div>
  );
}

/* =================================================
   MODAL HEADER
================================================= */

function ModalHeader({
  icon,
  title,
  description,
  onClose,
}: {
  icon: string;
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5">

      <div className="flex items-start gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/[0.08] text-indigo-300">
          {icon}
        </div>

        <div>

          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
      >
        ×
      </button>

    </div>
  );
}

