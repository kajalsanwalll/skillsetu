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

// Shared field styling — matches the SkillSetu input language
const fieldClass = `
  w-full rounded-xl border border-[#232B47] bg-[#0F1526]
  px-4 py-3 text-sm text-[#F5F1E8] placeholder:text-[#5B6386]
  outline-none transition
  focus:border-[#E8598B] focus:ring-1 focus:ring-[#E8598B]/30
`;

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
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
        <div className="mx-auto max-w-6xl">
          <p className="text-[#9AA3C0]">
            Loading your skill evidence…
          </p>
        </div>
        <ThemeStyles />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E8598B]">
            Skill evidence
          </p>

          <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-normal tracking-tight">
            Prove Your Skills
          </h1>

          <p className="mt-3 max-w-2xl text-[#C7CCE0]">
            Add projects, assessments, certifications,
            internships and other evidence that supports
            your Skill DNA.
          </p>
        </section>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-4 text-sm text-[#F3AFC6]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-[#2BA792]/30 bg-[#2BA792]/10 p-4 text-sm text-[#5FD6BE]">
            {success}
          </div>
        )}

        {/* Add evidence */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <h2 className="font-serif text-2xl">
            Add Evidence
          </h2>

          <p className="mt-1 text-sm text-[#9AA3C0]">
            Connect evidence to one of your existing
            skills.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* Skill */}
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                Skill
              </label>

              <select
                value={skillId}
                onChange={(event) =>
                  setSkillId(event.target.value)
                }
                className={fieldClass}
              >
                <option value="" className="bg-[#0F1526]">
                  Select a skill
                </option>

                {skills.map((studentSkill) => (
                  <option
                    key={studentSkill.skillId}
                    value={studentSkill.skillId}
                    className="bg-[#0F1526]"
                  >
                    {studentSkill.skill.name} (
                    {studentSkill.proficiency}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                Evidence Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                className={fieldClass}
              >
                {evidenceTypes.map(
                  (evidenceType) => (
                    <option
                      key={evidenceType.value}
                      value={evidenceType.value}
                      className="bg-[#0F1526]"
                    >
                      {evidenceType.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. E-commerce Backend Project"
                className={fieldClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
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
                className={`${fieldClass} resize-none`}
              />
            </div>

            {/* URL */}
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                Evidence URL
                <span className="ml-2 text-[11px] normal-case tracking-normal text-[#5B6386]">
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
                className={fieldClass}
              />
            </div>

            {/* Score */}
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                Score
                <span className="ml-2 text-[11px] normal-case tracking-normal text-[#5B6386]">
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
                className={fieldClass}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#E8598B] px-6 py-3 text-sm font-medium text-[#0F1526] transition hover:bg-[#f082ab] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {saving
                ? "Adding…"
                : "Add Evidence"}
            </button>

          </form>
        </section>

        {/* Existing evidence */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div>
            <h2 className="font-serif text-2xl">
              Your Evidence
            </h2>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Evidence currently associated with your
              Skill DNA.
            </p>
          </div>

          {evidence.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[#232B47] p-8 text-center">
              <p className="font-medium text-[#F5F1E8]">
                No evidence added yet
              </p>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Add a project, assessment or
                certification above.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {evidence.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-[#232B47] bg-[#0F1526]/60 p-5"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                    <div>
                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-[#F5F1E8]">
                          {item.title}
                        </h3>

                        <span className="rounded-full border border-[#E8598B]/25 bg-[#E8598B]/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[#E8598B]">
                          {item.type.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                      </div>

                      <p className="mt-1 text-sm font-medium text-[#F4A93B]">
                        {item.skill.name}
                      </p>

                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-[#C7CCE0]">
                          {item.description}
                        </p>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm font-medium text-[#E8598B] underline underline-offset-4 hover:text-[#F3AFC6] transition"
                        >
                          View Evidence →
                        </a>
                      )}
                    </div>

                    <div className="shrink-0 text-left md:text-right">

                      {item.score !== null && (
                        <p className="font-serif text-lg text-[#F4A93B]">
                          {item.score}%
                        </p>
                      )}

                      <p
                        className={`mt-1 font-mono text-[11px] uppercase tracking-wide ${
                          item.verified
                            ? "text-[#2BA792]"
                            : "text-[#F4A93B]"
                        }`}
                      >
                        {item.verified
                          ? "Verified"
                          : "Pending verification"}
                      </p>

                      <p className="mt-1 text-xs text-[#5B6386]">
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