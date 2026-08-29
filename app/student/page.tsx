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

      // Keep local evidence/credential state
      // synchronized with profile if available.
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
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#9AA3C0]">
            Loading your Skill DNA...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !profile || !user) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#f083a8]">
            {error ||
              "Student profile unavailable."}
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <section className="mb-8">
          <p className="text-sm text-[#F4A93B] mb-2">
            STUDENT
          </p>

          <h1 className="text-4xl font-bold">
            Welcome, {user.name}
          </h1>

          <p className="text-[#9AA3C0] mt-2">
            Build your Skill DNA and discover
            opportunities that match your strengths.
          </p>
        </section>

        {/* STATS — one row instead of four boxes */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6 mb-6 flex flex-wrap gap-8">
          <Stat label="Skills" value={profile.skills.length} />
          <Stat label="Evidence" value={profile.evidence.length} />
          <Stat label="Credentials" value={credentials.length} />
          <Stat label="Assessments" value={profile.assessments.length} />
        </section>

        {/* CAREER PROFILE */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Career Profile
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <p className="text-xs text-[#9AA3C0]">
                Career interest
              </p>

              <p className="mt-2 text-[#C7CCE0]">
                {profile.careerInterest ||
                  "Not set yet"}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#9AA3C0]">
                About you
              </p>

              <p className="mt-2 text-[#C7CCE0]">
                {profile.bio ||
                  "Tell SkillSetu about yourself."}
              </p>
            </div>

          </div>

        </section>

        {/* SKILL DNA */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                Your Skill DNA
              </h2>

              <p className="text-sm text-[#9AA3C0] mt-1">
                Skills you currently have and how
                strongly they are verified.
              </p>
            </div>

            <button
              onClick={() => {
                setSkillError("");
                setShowAddSkill(true);
              }}
              className="rounded-xl bg-[#F4A93B] px-4 py-2 text-sm font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition"
            >
              + Add Skill
            </button>

          </div>

          {profile.skills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#232B47] p-10 text-center">

              <p className="text-[#9AA3C0]">
                Your Skill DNA is empty.
              </p>

              <p className="text-sm text-[#5B6488] mt-2">
                Add your first skill to start building
                your profile.
              </p>

            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">

              {profile.skills.map(
                (studentSkill) => (

                  <div
                    key={studentSkill.id}
                    className="rounded-xl border border-[#232B47] p-5"
                  >

                    <div className="flex justify-between gap-4">

                      <div>
                        <h3 className="font-semibold">
                          {studentSkill.skill.name}
                        </h3>

                        <p className="text-xs text-[#9AA3C0] mt-1">
                          {studentSkill.skill.category ||
                            "General"}
                        </p>
                      </div>

                      <span className="text-[#F4A93B] font-semibold">
                        {studentSkill.proficiency}%
                      </span>

                    </div>

                    <div className="h-2 rounded-full bg-white/10 mt-4 overflow-hidden">

                      <div
                        className="h-full bg-[#F4A93B] rounded-full"
                        style={{
                          width: `${Math.min(
                            studentSkill.proficiency,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <p className="text-xs text-[#9AA3C0] mt-3">
                      Verification:{" "}
                      {studentSkill.verificationStrength}
                    </p>

                  </div>

                )
              )}

            </div>
          )}

        </section>

        {/* ADD SKILL MODAL */}

        {showAddSkill && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">

            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-[#232B47] bg-[#171E33] p-6 shadow-2xl">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-2xl font-semibold text-[#F5F1E8]">
                    Add a Skill
                  </h2>

                  <p className="mt-1 text-sm text-[#9AA3C0]">
                    Tell SkillSetu what you are good at.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddSkill(false)
                  }
                  className="text-2xl text-[#9AA3C0] hover:text-[#F5F1E8]"
                >
                  ×
                </button>

              </div>

              <div className="mt-6 space-y-5">

                <div>
                  <label
                    htmlFor="skill-name"
                    className="mb-2 block text-sm font-medium text-[#C7CCE0]"
                  >
                    Skill
                  </label>

                  <input
                    id="skill-name"
                    type="text"
                    value={skillName}
                    onChange={(e) =>
                      setSkillName(e.target.value)
                    }
                    placeholder="e.g. React, Python, SQL"
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />
                </div>

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-medium text-[#C7CCE0]">
                      Proficiency
                    </label>

                    <span className="font-semibold text-[#F4A93B]">
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
                    className="w-full"
                  />

                  <div className="mt-2 flex justify-between text-xs text-[#9AA3C0]">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                  </div>

                </div>

                {skillError && (
                  <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-3 text-sm text-[#f083a8]">
                    {skillError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddSkill(false)
                    }
                    className="flex-1 rounded-xl border border-[#232B47] px-4 py-3 text-sm text-[#C7CCE0] hover:bg-white/5"
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
                    className="flex-1 rounded-xl bg-[#F4A93B] px-4 py-3 font-semibold text-[#0F1526] hover:bg-[#f6bd6a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingSkill
                      ? "Adding..."
                      : "Add Skill"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* EVIDENCE */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                Evidence
              </h2>

              <p className="text-sm text-[#9AA3C0] mt-1">
                Proof supporting your skills.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEvidenceError("");
                setShowEvidenceModal(true);
              }}
              className="rounded-xl bg-[#F4A93B] px-4 py-2 text-sm font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition"
            >
              + Add Evidence
            </button>

          </div>

          {profile.evidence.length === 0 ? (

            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">

              <p className="text-[#9AA3C0]">
                No evidence added yet.
              </p>

              <p className="text-sm text-[#5B6488] mt-2">
                Add projects, certifications,
                internships or assessments.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {profile.evidence.map(
                (item) => (

                  <div
                    key={item.id}
                    className="rounded-xl border border-[#232B47] p-5"
                  >

                    <div className="flex justify-between gap-4">

                      <div>

                        <p className="font-medium">
                          {item.title}
                        </p>

                        <p className="text-sm text-[#9AA3C0] mt-1">
                          {item.skill.name} •{" "}
                          {item.type}
                        </p>

                      </div>

                      <span
                        className={`text-xs ${
                          item.verified
                            ? "text-[#6fd6c4]"
                            : "text-[#9AA3C0]"
                        }`}
                      >
                        {item.verified
                          ? "✓ Verified"
                          : item.verificationStrength}
                      </span>

                    </div>

                    {item.description && (
                      <p className="mt-3 text-sm text-[#9AA3C0]">
                        {item.description}
                      </p>
                    )}

                    {item.score !== null &&
                      item.score !== undefined && (
                        <p className="mt-3 text-sm text-[#C7CCE0]">
                          Score:{" "}
                          <span className="text-[#F5F1E8] font-semibold">
                            {item.score}
                          </span>
                        </p>
                      )}

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-[#F4A93B] hover:text-[#f6bd6a]"
                      >
                        View Evidence →
                      </a>
                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ADD EVIDENCE MODAL */}

        {showEvidenceModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#232B47] bg-[#171E33] p-6 shadow-2xl">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-2xl font-semibold">
                    Add Evidence
                  </h2>

                  <p className="mt-1 text-sm text-[#9AA3C0]">
                    Add proof supporting one of your skills.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowEvidenceModal(false)
                  }
                  className="text-2xl text-[#9AA3C0] hover:text-[#F5F1E8]"
                >
                  ×
                </button>

              </div>

              <div className="mt-6 space-y-5">

                {/* SKILL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
                    Skill
                  </label>

                  <select
                    value={selectedSkillId}
                    onChange={(e) =>
                      setSelectedSkillId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#232B47] bg-[#0F1526] px-4 py-3 text-[#F5F1E8] outline-none"
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
                          {
                            studentSkill.skill
                              .name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
                    Evidence Type
                  </label>

                  <select
                    value={evidenceType}
                    onChange={(e) =>
                      setEvidenceType(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#232B47] bg-[#0F1526] px-4 py-3 text-[#F5F1E8]"
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

                    <option value="SELF_REPORTED">
                      Self Reported
                    </option>

                  </select>

                </div>

                {/* TITLE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
                    Title
                  </label>

                  <input
                    type="text"
                    value={evidenceTitle}
                    onChange={(e) =>
                      setEvidenceTitle(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Full-stack Portfolio"
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
                    Description
                  </label>

                  <textarea
                    value={evidenceDescription}
                    onChange={(e) =>
                      setEvidenceDescription(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Describe what you built or achieved..."
                    className="w-full resize-none rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {/* URL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {/* SCORE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
                    Score{" "}
                    <span className="text-[#9AA3C0]">
                      (optional)
                    </span>
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
                    placeholder="e.g. 85"
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {evidenceError && (
                  <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-3 text-sm text-[#f083a8]">
                    {evidenceError}
                  </div>
                )}

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setShowEvidenceModal(false)
                    }
                    className="flex-1 rounded-xl border border-[#232B47] px-4 py-3 text-sm text-[#C7CCE0] hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleAddEvidence}
                    disabled={
                      savingEvidence ||
                      !selectedSkillId ||
                      !evidenceTitle.trim()
                    }
                    className="flex-1 rounded-xl bg-[#F4A93B] px-4 py-3 font-semibold text-[#0F1526] hover:bg-[#f6bd6a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingEvidence
                      ? "Adding..."
                      : "Add Evidence"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ACADEMIC CREDENTIALS */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7 mb-6">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-semibold">
                Academic Credentials
              </h2>

              <p className="text-sm text-[#9AA3C0] mt-1">
                NPTEL and other recognized academic achievements.
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setCredentialError("");
                setShowCredentialModal(true);
              }}
              className="rounded-xl bg-[#F4A93B] px-4 py-2 text-sm font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition"
            >
              + Add Credential
            </button>

          </div>

          {credentials.length === 0 ? (

            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">

              <p className="text-[#9AA3C0]">
                No academic credentials added yet.
              </p>

              <p className="text-sm text-[#5B6488] mt-2">
                Add your NPTEL certifications and academic achievements.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-4">

              {credentials.map(
                (credential) => (

                  <div
                    key={credential.id}
                    className="rounded-xl border border-[#232B47] p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs uppercase tracking-wider text-[#F4A93B]">
                          {credential.source}
                        </p>

                        <h3 className="mt-1 font-semibold">
                          {credential.title}
                        </h3>

                        {credential.institution && (
                          <p className="mt-1 text-sm text-[#9AA3C0]">
                            {credential.institution}
                          </p>
                        )}

                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          credential.verified
                            ? "bg-[#2BA792]/10 text-[#6fd6c4]"
                            : "bg-white/5 text-[#9AA3C0]"
                        }`}
                      >
                        {credential.verified
                          ? "Verified"
                          : credential.verificationStrength}
                      </span>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#C7CCE0]">

                      {credential.score !== null &&
                        credential.score !== undefined && (
                          <span>
                            Score:{" "}
                            <strong className="text-[#F5F1E8]">
                              {credential.score}%
                            </strong>
                          </span>
                        )}

                      {credential.credits !== null &&
                        credential.credits !== undefined && (
                          <span>
                            Credits:{" "}
                            <strong className="text-[#F5F1E8]">
                              {credential.credits}
                            </strong>
                          </span>
                        )}

                    </div>

                    {credential.credentialId && (
                      <p className="mt-3 text-xs text-[#9AA3C0]">
                        Credential ID:{" "}
                        {credential.credentialId}
                      </p>
                    )}

                    {credential.issueDate && (
                      <p className="mt-2 text-xs text-[#9AA3C0]">
                        Issued:{" "}
                        {new Date(
                          credential.issueDate
                        ).toLocaleDateString()}
                      </p>
                    )}

                    {credential.verificationUrl && (
                      <a
                        href={
                          credential.verificationUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm text-[#F4A93B] hover:text-[#f6bd6a]"
                      >
                        Verify Credential →
                      </a>
                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ADD CREDENTIAL MODAL */}

        {showCredentialModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#232B47] bg-[#171E33] p-6 shadow-2xl">

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-2xl font-semibold">
                    Add Academic Credential
                  </h2>

                  <p className="mt-1 text-sm text-[#9AA3C0]">
                    Add an NPTEL certification or academic achievement.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCredentialModal(false)
                  }
                  className="text-2xl text-[#9AA3C0] hover:text-[#F5F1E8]"
                >
                  ×
                </button>

              </div>

              <div className="mt-6 space-y-5">

                {/* SOURCE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
                    Source
                  </label>

                  <select
                    value={credentialSource}
                    onChange={(e) =>
                      setCredentialSource(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#232B47] bg-[#0F1526] px-4 py-3 text-[#F5F1E8]"
                  >

                    <option value="NPTEL">
                      NPTEL
                    </option>

                    <option value="ACADEMIC_CREDENTIAL">
                      Academic Credential
                    </option>

                  </select>

                </div>

                {/* TITLE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                    placeholder="e.g. Programming in Python"
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {/* INSTITUTION */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                    placeholder="e.g. NPTEL / IIT Madras"
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {/* CREDENTIAL ID */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                    placeholder="Certificate / credential ID"
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {/* SCORE + CREDITS */}

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                      className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                      className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                    />

                  </div>

                </div>

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {/* VERIFICATION URL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#C7CCE0]">
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
                    placeholder="Certificate verification URL"
                    className="w-full rounded-xl border border-[#232B47] bg-white/5 px-4 py-3 text-[#F5F1E8] placeholder-[#5B6488] outline-none focus:border-[#F4A93B]"
                  />

                </div>

                {credentialError && (
                  <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-3 text-sm text-[#f083a8]">
                    {credentialError}
                  </div>
                )}

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setShowCredentialModal(false)
                    }
                    className="flex-1 rounded-xl border border-[#232B47] px-4 py-3 text-sm text-[#C7CCE0] hover:bg-white/5"
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
                    className="flex-1 rounded-xl bg-[#F4A93B] px-4 py-3 font-semibold text-[#0F1526] hover:bg-[#f6bd6a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingCredential
                      ? "Adding..."
                      : "Add Credential"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ASSESSMENTS */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7">

          <h2 className="text-xl font-semibold">
            Assessments
          </h2>

          <p className="text-sm text-[#9AA3C0] mt-1 mb-6">
            Your assessment performance.
          </p>

          {profile.assessments.length === 0 ? (

            <div className="rounded-xl border border-dashed border-[#232B47] p-8 text-center">

              <p className="text-[#9AA3C0]">
                No assessments yet.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {profile.assessments.map(
                (assessment) => (

                  <div
                    key={assessment.id}
                    className="rounded-xl border border-[#232B47] p-4 flex justify-between"
                  >

                    <span>
                      {assessment.title}
                    </span>

                    <span className="font-semibold text-[#F4A93B]">
                      {assessment.score}%
                    </span>

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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-3xl font-bold text-[#F5F1E8]">{value}</p>
      <p className="text-sm text-[#9AA3C0] mt-1">{label}</p>
    </div>
  );
}