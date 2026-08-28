"use client";

import { useEffect, useState } from "react";

type Skill = {
  id: string;
  name: string;
  category: string | null;
};

type Evidence = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  score: number | null;
  type: string;
  verified: boolean;
  verificationStrength: string;
  createdAt: string;
  skill: Skill;
};

type StudentSkill = {
  id: string;
  skillId: string;
  proficiency: number;
  skill: Skill;
};

const evidenceTypes = [
  {
    value: "PROJECT",
    label: "Project",
  },
  {
    value: "ASSESSMENT",
    label: "Assessment",
  },
  {
    value: "CERTIFICATION",
    label: "Certification",
  },
  {
    value: "INTERNSHIP",
    label: "Internship",
  },
  {
    value: "NPTEL",
    label: "NPTEL",
  },
  {
    value: "ACADEMIC_CREDENTIAL",
    label: "Academic Credential",
  },
  {
    value: "SELF_REPORTED",
    label: "Self Reported",
  },
];

export default function StudentEvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>(
    []
  );

  const [skills, setSkills] = useState<StudentSkill[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [skillId, setSkillId] = useState("");

  const [type, setType] = useState("PROJECT");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [url, setUrl] = useState("");

  const [score, setScore] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [evidenceResponse, profileResponse] =
        await Promise.all([
          fetch("/api/student/evidence"),
          fetch("/api/student/profile"),
        ]);

      const evidenceData =
        await evidenceResponse.json();

      const profileData =
        await profileResponse.json();

      if (!evidenceResponse.ok) {
        throw new Error(
          evidenceData.error ||
            "Failed to load evidence."
        );
      }

      if (!profileResponse.ok) {
        throw new Error(
          profileData.error ||
            "Failed to load skills."
        );
      }

      setEvidence(
        evidenceData.evidence || []
      );

      setSkills(
        profileData.profile?.skills || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load evidence."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!skillId) {
      setError("Please select a skill.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter an evidence title.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/student/evidence",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skillId,
            type,
            title: title.trim(),
            description:
              description.trim() || null,
            url: url.trim() || null,
            score: score || null,
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

      setEvidence((current) => [
        data.evidence,
        ...current,
      ]);

      setSkillId("");
      setType("PROJECT");
      setTitle("");
      setDescription("");
      setUrl("");
      setScore("");

      setSuccess(
        "Evidence added successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add evidence."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-500">
            Loading your skill evidence...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-purple-600">
            SKILL EVIDENCE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Prove Your Skills
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Add projects, assessments, certifications,
            internships and other evidence that supports
            your Skill DNA.
          </p>
        </section>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Add evidence */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            Add Evidence
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Connect evidence to one of your existing
            skills.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* Skill */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Skill
              </label>

              <select
                value={skillId}
                onChange={(event) =>
                  setSkillId(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
              >
                <option value="">
                  Select a skill
                </option>

                {skills.map((studentSkill) => (
                  <option
                    key={studentSkill.skillId}
                    value={studentSkill.skillId}
                  >
                    {studentSkill.skill.name} (
                    {studentSkill.proficiency}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Evidence Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
              >
                {evidenceTypes.map(
                  (evidenceType) => (
                    <option
                      key={evidenceType.value}
                      value={evidenceType.value}
                    >
                      {evidenceType.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. E-commerce Backend Project"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe how this evidence demonstrates the skill..."
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>

            {/* URL */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Evidence URL
                <span className="ml-2 text-xs text-gray-400">
                  Optional
                </span>
              </label>

              <input
                type="url"
                value={url}
                onChange={(event) =>
                  setUrl(event.target.value)
                }
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>

            {/* Score */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Score
                <span className="ml-2 text-xs text-gray-400">
                  Optional
                </span>
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(event) =>
                  setScore(event.target.value)
                }
                placeholder="e.g. 92"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Adding..."
                : "Add Evidence"}
            </button>

          </form>
        </section>

        {/* Existing evidence */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <div>
            <h2 className="text-xl font-bold">
              Your Evidence
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Evidence currently associated with your
              Skill DNA.
            </p>
          </div>

          {evidence.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <p className="font-medium">
                No evidence added yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add a project, assessment or
                certification above.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {evidence.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-gray-100 p-5"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs text-purple-700">
                          {item.type.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                      </div>

                      <p className="mt-1 text-sm font-medium text-purple-600">
                        {item.skill.name}
                      </p>

                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm font-medium text-blue-600 underline"
                        >
                          View Evidence →
                        </a>
                      )}
                    </div>

                    <div className="shrink-0 text-left md:text-right">

                      {item.score !== null && (
                        <p className="text-lg font-bold">
                          {item.score}%
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-500">
                        {item.verified
                          ? "Verified"
                          : "Pending verification"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {item.verificationStrength}
                      </p>

                    </div>

                  </div>

                </article>
              ))}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}