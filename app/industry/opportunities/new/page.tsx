"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OpportunityType =
  | "INTERNSHIP"
  | "JOB"
  | "PROJECT"
  | "MENTORSHIP"
  | "FDP"
  | "RESEARCH"
  | "CONSULTANCY"
  | "INDUSTRIAL_TRAINING"
  | "GUEST_LECTURE";

type CompetencyLevel =
  | "EXPOSURE"
  | "FOUNDATIONAL"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

type Skill = {
  name: string;
  category: string;
  importance: "CORE" | "IMPORTANT" | "USEFUL";
  required: boolean;
  requiredLevel: CompetencyLevel;
  weight: number;
};

type ExtractedOpportunity = {
  title: string;
  company: string;
  description: string;
  location: string | null;
  type: OpportunityType;
  skills: Skill[];
};

const opportunityTypes: {
  value: OpportunityType;
  label: string;
}[] = [
  { value: "INTERNSHIP", label: "Internship" },
  { value: "JOB", label: "Job" },
  { value: "PROJECT", label: "Project" },
  { value: "MENTORSHIP", label: "Mentorship" },
  { value: "FDP", label: "FDP" },
  { value: "RESEARCH", label: "Research" },
  { value: "CONSULTANCY", label: "Consultancy" },
  {
    value: "INDUSTRIAL_TRAINING",
    label: "Industrial Training",
  },
  {
    value: "GUEST_LECTURE",
    label: "Guest Lecture",
  },
];

const competencyLevels: {
  value: CompetencyLevel;
  label: string;
}[] = [
  {
    value: "EXPOSURE",
    label: "Exposure",
  },
  {
    value: "FOUNDATIONAL",
    label: "Foundational",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
  },
  {
    value: "EXPERT",
    label: "Expert",
  },
];

const fieldClass = `
  mt-2 w-full rounded-lg border border-[#232B47] bg-[#0F1526]
  px-4 py-3 text-[#F5F1E8] placeholder:text-[#5B6386]
  outline-none transition
  focus:border-[#F4A93B] focus:ring-1 focus:ring-[#F4A93B]/30
`;

const smallFieldClass = `
  mt-1 w-full rounded-lg
  border border-[#232B47] bg-[#171E33]/60
  px-3 py-2 text-[#F5F1E8]
  outline-none transition
  focus:border-[#F4A93B]
  focus:ring-1 focus:ring-[#F4A93B]/30
`;

export default function NewOpportunityPage() {
  const router = useRouter();

  const [jobDescription, setJobDescription] = useState("");
  const [opportunity, setOpportunity] =
    useState<ExtractedOpportunity | null>(null);

  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleExtract() {
    if (!jobDescription.trim()) {
      setError(
        "Please paste a job or opportunity description."
      );
      return;
    }

    try {
      setExtracting(true);
      setError("");

      const response = await fetch(
        "/api/industry/extract",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription: jobDescription.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to extract opportunity requirements."
        );
      }

      setOpportunity(data.data);
    } catch (error) {
      console.error("EXTRACTION_ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to extract opportunity requirements."
      );
    } finally {
      setExtracting(false);
    }
  }

  function updateSkill(
    index: number,
    updates: Partial<Skill>
  ) {
    if (!opportunity) return;

    const updatedSkills = [...opportunity.skills];

    updatedSkills[index] = {
      ...updatedSkills[index],
      ...updates,
    };

    setOpportunity({
      ...opportunity,
      skills: updatedSkills,
    });
  }

  function removeSkill(index: number) {
    if (!opportunity) return;

    const updatedSkills = opportunity.skills.filter(
      (_, skillIndex) => skillIndex !== index
    );

    setOpportunity({
      ...opportunity,
      skills: updatedSkills,
    });
  }

  function addSkill() {
    if (!opportunity) return;

    setOpportunity({
      ...opportunity,
      skills: [
        ...opportunity.skills,
        {
          name: "",
          category: "General",
          importance: "USEFUL",
          weight: 0.5,
          required: true,
          requiredLevel: "FOUNDATIONAL",
        },
      ],
    });
  }

  async function handleSave() {
    if (!opportunity) return;

    if (!opportunity.title.trim()) {
      setError("Opportunity title is required.");
      return;
    }

    if (!opportunity.company.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!opportunity.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (opportunity.skills.length === 0) {
      setError("At least one skill is required.");
      return;
    }

    const invalidSkill = opportunity.skills.some(
      (skill) => !skill.name.trim()
    );

    if (invalidSkill) {
      setError("Every skill must have a name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/industry/opportunities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(opportunity),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create opportunity."
        );
      }

      router.push("/industry");
      router.refresh();
    } catch (error) {
      console.error(
        "CREATE_OPPORTUNITY_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create opportunity."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/industry")}
            className="font-mono text-xs uppercase tracking-[0.15em] text-[#9AA3C0] hover:text-[#F5F1E8] transition mb-6"
          >
            ← Back to Industry
          </button>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4A93B] mb-2">
            Industry · setu
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight">
            Create Opportunity
          </h1>

          <p className="text-[#C7CCE0] mt-3 max-w-xl">
            Paste a job or opportunity description and let
            SkillSetu extract the required skills for you.
          </p>
        </div>

        {/* JD Input */}
        {!opportunity && (
          <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

            <label className="block font-mono text-xs uppercase tracking-wide text-[#9AA3C0] mb-3">
              Job / Opportunity Description
            </label>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the complete job description here..."
              className="
                w-full min-h-[350px] rounded-xl
                border border-[#232B47] bg-[#0F1526]
                p-5 text-[#F5F1E8]
                placeholder:text-[#5B6386]
                outline-none transition resize-y
                focus:border-[#F4A93B]
                focus:ring-1 focus:ring-[#F4A93B]/30
              "
            />

            {error && (
              <div className="mt-4 rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-4 text-sm text-[#F3AFC6]">
                {error}
              </div>
            )}

            <button
              onClick={handleExtract}
              disabled={
                extracting ||
                !jobDescription.trim()
              }
              className="
                mt-5 w-full rounded-xl
                bg-[#F4A93B] px-6 py-4
                font-medium text-[#0F1526]
                transition hover:bg-[#f7b85e]
                disabled:opacity-30
                disabled:cursor-not-allowed
              "
            >
              {extracting
                ? "Extracting requirements…"
                : "Extract requirements"}
            </button>
          </section>
        )}

        {/* Review */}
        {opportunity && (
          <div className="space-y-8">

            {/* Opportunity details */}
            <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl">
                    Review opportunity
                  </h2>

                  <p className="text-sm text-[#9AA3C0] mt-1">
                    SkillSetu extracted the following.
                    Edit anything before publishing.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setOpportunity(null);
                    setError("");
                  }}
                  className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0] hover:text-[#F5F1E8] transition"
                >
                  ← Re-extract
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Title */}
                <div>
                  <label className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                    Title
                  </label>

                  <input
                    value={opportunity.title}
                    onChange={(e) =>
                      setOpportunity({
                        ...opportunity,
                        title: e.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                    Company
                  </label>

                  <input
                    value={opportunity.company}
                    onChange={(e) =>
                      setOpportunity({
                        ...opportunity,
                        company: e.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                    Location
                  </label>

                  <input
                    value={opportunity.location ?? ""}
                    onChange={(e) =>
                      setOpportunity({
                        ...opportunity,
                        location:
                          e.target.value || null,
                      })
                    }
                    placeholder="Remote / Bangalore / Chennai..."
                    className={fieldClass}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                    Opportunity type
                  </label>

                  <select
                    value={opportunity.type}
                    onChange={(e) =>
                      setOpportunity({
                        ...opportunity,
                        type:
                          e.target.value as OpportunityType,
                      })
                    }
                    className={fieldClass}
                  >
                    {opportunityTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                        className="bg-[#0F1526]"
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mt-5">
                <label className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                  Description
                </label>

                <textarea
                  value={opportunity.description}
                  onChange={(e) =>
                    setOpportunity({
                      ...opportunity,
                      description: e.target.value,
                    })
                  }
                  className={`${fieldClass} min-h-[200px] resize-y`}
                />
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl">
                    Required skills
                  </h2>

                  <p className="text-sm text-[#9AA3C0] mt-1">
                    Review and adjust the AI-generated
                    requirements.
                  </p>
                </div>

                <button
                  onClick={addSkill}
                  className="
                    rounded-xl border border-[#3A4266]
                    px-4 py-2 text-sm text-[#F5F1E8]
                    transition
                    hover:border-[#F4A93B]
                    hover:text-[#F4A93B]
                  "
                >
                  + Add skill
                </button>
              </div>

              <div className="space-y-4">

                {opportunity.skills.map(
                  (skill, index) => (
                    <div
                      key={`${skill.name}-${index}`}
                      className="
                        rounded-xl border border-[#232B47]
                        bg-[#0F1526]/60 p-5
                      "
                    >

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Skill name */}
                        <div>
                          <label className="font-mono text-[11px] uppercase tracking-wide text-[#7A82A6]">
                            Skill
                          </label>

                          <input
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(index, {
                                name: e.target.value,
                              })
                            }
                            className={smallFieldClass}
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="font-mono text-[11px] uppercase tracking-wide text-[#7A82A6]">
                            Category
                          </label>

                          <input
                            value={skill.category}
                            onChange={(e) =>
                              updateSkill(index, {
                                category:
                                  e.target.value,
                              })
                            }
                            className={smallFieldClass}
                          />
                        </div>

                        {/* Importance */}
                        <div>
                          <label className="font-mono text-[11px] uppercase tracking-wide text-[#7A82A6]">
                            Importance
                          </label>

                          <select
                            value={skill.importance}
                            onChange={(e) =>
                              updateSkill(index, {
                                importance:
                                  e.target
                                    .value as Skill["importance"],
                              })
                            }
                            className={smallFieldClass}
                          >
                            <option
                              value="CORE"
                              className="bg-[#0F1526]"
                            >
                              Core
                            </option>

                            <option
                              value="IMPORTANT"
                              className="bg-[#0F1526]"
                            >
                              Important
                            </option>

                            <option
                              value="USEFUL"
                              className="bg-[#0F1526]"
                            >
                              Useful
                            </option>
                          </select>
                        </div>

                        {/* Required level */}
                        <div>
                          <label className="font-mono text-[11px] uppercase tracking-wide text-[#7A82A6]">
                            Required level
                          </label>

                          <select
                            value={
                              skill.requiredLevel
                            }
                            onChange={(e) =>
                              updateSkill(index, {
                                requiredLevel:
                                  e.target
                                    .value as CompetencyLevel,
                              })
                            }
                            className={smallFieldClass}
                          >
                            {competencyLevels.map(
                              (level) => (
                                <option
                                  key={level.value}
                                  value={level.value}
                                  className="bg-[#0F1526]"
                                >
                                  {level.label}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Weight */}
                        <div className="md:col-span-2">
                          <label className="font-mono text-[11px] uppercase tracking-wide text-[#7A82A6]">
                            Weight ·{" "}
                            <span className="text-[#E8598B]">
                              {(
                                skill.weight ?? 0
                              ).toFixed(2)}
                            </span>
                          </label>

                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={
                              skill.weight ?? 0
                            }
                            onChange={(e) =>
                              updateSkill(index, {
                                weight: Number(
                                  e.target.value
                                ),
                              })
                            }
                            className="mt-3 w-full accent-[#E8598B]"
                          />
                        </div>
                      </div>

                      {/* Required + delete */}
                      <div className="flex items-center justify-between mt-5">

                        <label className="flex items-center gap-2 text-sm text-[#C7CCE0]">
                          <input
                            type="checkbox"
                            checked={skill.required}
                            onChange={(e) =>
                              updateSkill(index, {
                                required:
                                  e.target.checked,
                              })
                            }
                            className="accent-[#F4A93B]"
                          />

                          Required skill
                        </label>

                        <button
                          onClick={() =>
                            removeSkill(index)
                          }
                          className="text-sm text-[#E8598B] hover:text-[#F3AFC6] transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-4 text-sm text-[#F3AFC6]">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="
                w-full rounded-xl bg-[#F4A93B]
                px-6 py-4 text-lg font-medium
                text-[#0F1526]
                transition hover:bg-[#f7b85e]
                disabled:opacity-30
                disabled:cursor-not-allowed
              "
            >
              {saving
                ? "Creating opportunity…"
                : "Create opportunity"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz@0,9..144;1,9..144&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap");

        .font-serif {
          font-family: "Fraunces", serif;
        }

        main {
          font-family: "IBM Plex Sans", sans-serif;
        }

        .font-mono {
          font-family: "IBM Plex Mono", monospace;
        }
      `}</style>
    </main>
  );
}