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
  verified: boolean;
  verificationStrength: string;
  skill: Skill;
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
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(
    null
  );

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
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

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400">
            Loading your Skill DNA...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile || !user) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error || "Student profile unavailable."}
          </div>
        </div>
      </main>
    );
  }

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
        data.error || "Failed to add skill."
      );
    }

    // Refresh profile
    const profileResponse = await fetch(
      "/api/student/profile"
    );

    const profileData =
      await profileResponse.json();

    if (!profileResponse.ok) {
      throw new Error(
        profileData.error ||
          "Skill was added but profile could not be refreshed."
      );
    }

    setProfile(profileData.profile);

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

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <section className="mb-10">
          <p className="text-sm text-purple-400 mb-2">
            STUDENT
          </p>

          <h1 className="text-4xl font-bold">
            Welcome, {user.name}
          </h1>

          <p className="text-gray-400 mt-2">
            Build your Skill DNA and discover
            opportunities that match your strengths.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-400">
              Skills
            </p>

            <p className="text-3xl font-bold mt-2">
              {profile.skills.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-400">
              Evidence
            </p>

            <p className="text-3xl font-bold mt-2">
              {profile.evidence.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-400">
              Assessments
            </p>

            <p className="text-3xl font-bold mt-2">
              {profile.assessments.length}
            </p>
          </div>

        </section>

        {/* Career */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Career Profile
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <p className="text-xs text-gray-500">
                Career interest
              </p>

              <p className="mt-2 text-gray-200">
                {profile.careerInterest ||
                  "Not set yet"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                About you
              </p>

              <p className="mt-2 text-gray-200">
                {profile.bio ||
                  "Tell SkillSetu about yourself."}
              </p>
            </div>

          </div>

        </section>

        {/* Skill DNA */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Your Skill DNA
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Skills you currently have and how
                strongly they are verified.
              </p>
            </div>

            <button
                onClick={() => {
                       setSkillError("");
                       setShowAddSkill(true);
                }}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500 transition"
                >
                + Add Skill
            </button>
          </div>

          {profile.skills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-gray-400">
                Your Skill DNA is empty.
              </p>

              <p className="text-sm text-gray-500 mt-2">
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
                    className="rounded-xl border border-white/10 p-5"
                  >

                    <div className="flex justify-between gap-4">

                      <div>
                        <h3 className="font-semibold">
                          {studentSkill.skill.name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          {studentSkill.skill.category ||
                            "General"}
                        </p>
                      </div>

                      <span className="text-purple-300 font-semibold">
                        {studentSkill.proficiency}%
                      </span>

                    </div>

                    <div className="h-2 rounded-full bg-white/10 mt-4 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            studentSkill.proficiency,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Verification:{" "}
                      {studentSkill.verificationStrength}
                    </p>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {showAddSkill && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">

    <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111116] p-6 shadow-2xl">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-2xl font-semibold text-white">
            Add a Skill
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Tell SkillSetu what you're good at.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddSkill(false)}
          className="text-2xl text-gray-500 hover:text-white"
        >
          ×
        </button>

      </div>

      {/* Form */}
      <div className="mt-6 space-y-5">

        {/* Skill */}
        <div>
          <label
            htmlFor="skill-name"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Skill
          </label>

          <input
            id="skill-name"
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g. React, Python, SQL"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500"
          />
        </div>

        {/* Proficiency */}
        <div>

          <div className="mb-2 flex items-center justify-between">

            <label className="text-sm font-medium text-gray-300">
              Proficiency
            </label>

            <span className="font-semibold text-purple-400">
              {proficiency}%
            </span>

          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={proficiency}
            onChange={(e) =>
              setProficiency(Number(e.target.value))
            }
            className="w-full"
          />

          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
          </div>

        </div>

        {/* Error */}
        {skillError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {skillError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">

          <button
            type="button"
            onClick={() => setShowAddSkill(false)}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAddSkill}
            disabled={
              savingSkill || !skillName.trim()
            }
            className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingSkill ? "Adding..." : "Add Skill"}
          </button>

        </div>

      </div>

    </div>

  </div>
)}

        {/* Evidence */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 mb-6">

          <h2 className="text-xl font-semibold">
            Evidence
          </h2>

          <p className="text-sm text-gray-400 mt-1 mb-6">
            Proof supporting your skills.
          </p>

          {profile.evidence.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-gray-500">
                No evidence added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {profile.evidence.map(
                (evidence) => (
                  <div
                    key={evidence.id}
                    className="rounded-xl border border-white/10 p-4"
                  >

                    <div className="flex justify-between">

                      <div>
                        <p className="font-medium">
                          {evidence.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          {evidence.skill.name} •{" "}
                          {evidence.type}
                        </p>
                      </div>

                      <span className="text-xs text-gray-400">
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

        </section>

        {/* Assessments */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">

          <h2 className="text-xl font-semibold">
            Assessments
          </h2>

          <p className="text-sm text-gray-400 mt-1 mb-6">
            Your assessment performance.
          </p>

          {profile.assessments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-gray-500">
                No assessments yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {profile.assessments.map(
                (assessment) => (
                  <div
                    key={assessment.id}
                    className="rounded-xl border border-white/10 p-4 flex justify-between"
                  >
                    <span>
                      {assessment.title}
                    </span>

                    <span className="font-semibold text-purple-300">
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