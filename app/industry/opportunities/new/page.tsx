
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

type Skill = {
  name: string;
  category: string;
  minimumProficiency: number;
  weight: number;
  required: boolean;
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
      setError("Please paste a job or opportunity description.");
      return;
    }

    try {
      setExtracting(true);
      setError("");

      const response = await fetch("/api/industry/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
        }),
      });

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
          minimumProficiency: 50,
          weight: 0.5,
          required: true,
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

    const invalidSkill = opportunity.skills.some(
      (skill) => !skill.name.trim()
    );

    if (invalidSkill) {
      setError("Every skill must have a name.");
      return;
    }

    if (opportunity.skills.length === 0) {
      setError("At least one skill is required.");
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
          data.error || "Failed to create opportunity."
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
    <main className="min-h-screen bg-[#08080c] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/industry")}
            className="group mb-7 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Back to Industry
          </button>

          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
              Industry
            </p>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Create an{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-300 bg-clip-text text-transparent">
              opportunity.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
            Paste a job or opportunity description and let
            SkillSetu intelligently extract the skills required
            to find the right talent.
          </p>
        </div>

        {/* Initial JD Input */}
        {!opportunity && (
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">

            {/* Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-purple-600/10 blur-[90px]" />

            <div className="relative">
              {/* Section heading */}
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-lg text-purple-300">
                  ✦
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Opportunity Description
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add the complete job description to begin
                    extracting requirements.
                  </p>
                </div>
              </div>

              <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-gray-500">
                Job / Opportunity Description
              </label>

              <textarea
                value={jobDescription}
                onChange={(e) =>
                  setJobDescription(e.target.value)
                }
                placeholder="Paste the complete job description here...

Example:
We are looking for a software engineering intern with experience in React, Node.js, and PostgreSQL..."
                className="
                  min-h-[360px]
                  w-full
                  resize-y
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-black/30
                  p-5
                  text-sm
                  leading-7
                  text-white
                  outline-none
                  transition-all
                  placeholder:text-gray-700
                  focus:border-purple-500/50
                  focus:bg-black/40
                  focus:ring-1
                  focus:ring-purple-500/20
                "
              />

              {error && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleExtract}
                disabled={
                  extracting ||
                  !jobDescription.trim()
                }
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-600
                  to-indigo-600
                  px-6
                  py-4
                  text-sm
                  font-semibold
                  shadow-lg
                  shadow-purple-600/20
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:from-purple-500
                  hover:to-indigo-500
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:translate-y-0
                "
              >
                {extracting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Extracting requirements...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    Extract Requirements
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400/70" />
                AI-powered skill extraction
                <span>•</span>
                Review before publishing
              </div>
            </div>
          </section>
        )}

        {/* Review */}
        {opportunity && (
          <div className="space-y-7">

            {/* AI success banner */}
            <div className="flex items-start gap-4 rounded-2xl border border-purple-500/20 bg-purple-500/[0.06] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                ✦
              </div>

              <div>
                <p className="text-sm font-semibold text-purple-200">
                  Requirements extracted successfully
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  SkillSetu extracted the opportunity details
                  below. Review and edit anything before
                  publishing.
                </p>
              </div>
            </div>

            {/* Opportunity details */}
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-sm sm:p-8">

              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />

                    <span className="text-xs font-medium uppercase tracking-wider text-purple-400">
                      Step 1
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold">
                    Opportunity Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review the information extracted from the
                    description.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setOpportunity(null);
                    setError("");
                  }}
                  className="self-start rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  ← Re-extract
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Title */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
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
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-black/30
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-purple-500/50
                      focus:ring-1
                      focus:ring-purple-500/20
                    "
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
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
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-black/30
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-purple-500/50
                      focus:ring-1
                      focus:ring-purple-500/20
                    "
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
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
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-black/30
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-gray-700
                      focus:border-purple-500/50
                      focus:ring-1
                      focus:ring-purple-500/20
                    "
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Opportunity Type
                  </label>

                  <select
                    value={opportunity.type}
                    onChange={(e) =>
                      setOpportunity({
                        ...opportunity,
                        type: e.target
                          .value as OpportunityType,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-black/30
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-purple-500/50
                      focus:ring-1
                      focus:ring-purple-500/20
                    "
                  >
                    {opportunityTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                        className="bg-[#0b0b0f]"
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mt-5">
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
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
                  className="
                    mt-2
                    min-h-[200px]
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-black/30
                    p-4
                    text-sm
                    leading-6
                    outline-none
                    transition
                    focus:border-purple-500/50
                    focus:ring-1
                    focus:ring-purple-500/20
                  "
                />
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-sm sm:p-8">

              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                    <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                      Step 2
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold">
                    Required Skills
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review and adjust the AI-generated
                    requirements.
                  </p>
                </div>

                <button
                  onClick={addSkill}
                  className="
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-300
                    transition
                    hover:border-purple-500/30
                    hover:bg-purple-500/[0.06]
                    hover:text-white
                  "
                >
                  + Add Skill
                </button>
              </div>

              <div className="space-y-4">
                {opportunity.skills.map(
                  (skill, index) => (
                    <div
                      key={`${skill.name}-${index}`}
                      className="
                        group
                        rounded-2xl
                        border
                        border-white/[0.07]
                        bg-black/20
                        p-5
                        transition-all
                        hover:border-white/[0.12]
                        hover:bg-black/30
                      "
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-xs text-purple-300">
                            {index + 1}
                          </div>

                          <span className="text-sm font-medium text-gray-300">
                            Skill Requirement
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            removeSkill(index)
                          }
                          className="rounded-lg px-3 py-1.5 text-xs text-red-400 opacity-70 transition hover:bg-red-500/10 hover:opacity-100"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Skill name */}
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                            Skill
                          </label>

                          <input
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(index, {
                                name: e.target.value,
                              })
                            }
                            className="
                              mt-2
                              w-full
                              rounded-xl
                              border
                              border-white/[0.08]
                              bg-black/30
                              px-4
                              py-3
                              text-sm
                              outline-none
                              transition
                              focus:border-purple-500/50
                            "
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
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
                            className="
                              mt-2
                              w-full
                              rounded-xl
                              border
                              border-white/[0.08]
                              bg-black/30
                              px-4
                              py-3
                              text-sm
                              outline-none
                              transition
                              focus:border-purple-500/50
                            "
                          />
                        </div>

                        {/* Proficiency */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                              Minimum Proficiency
                            </label>

                            <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300">
                              {skill.minimumProficiency}%
                            </span>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={
                              skill.minimumProficiency
                            }
                            onChange={(e) =>
                              updateSkill(index, {
                                minimumProficiency:
                                  Number(
                                    e.target.value
                                  ),
                              })
                            }
                            className="mt-4 w-full accent-purple-500"
                          />

                          <div className="mt-1 flex justify-between text-[10px] text-gray-700">
                            <span>Beginner</span>
                            <span>Expert</span>
                          </div>
                        </div>

                        {/* Weight */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                              Importance Weight
                            </label>

                            <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                              {skill.weight.toFixed(2)}
                            </span>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={skill.weight}
                            onChange={(e) =>
                              updateSkill(index, {
                                weight: Number(
                                  e.target.value
                                ),
                              })
                            }
                            className="mt-4 w-full accent-indigo-500"
                          />

                          <div className="mt-1 flex justify-between text-[10px] text-gray-700">
                            <span>Low</span>
                            <span>Critical</span>
                          </div>
                        </div>
                      </div>

                      {/* Required */}
                      <div className="mt-5 border-t border-white/[0.06] pt-5">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={skill.required}
                            onChange={(e) =>
                              updateSkill(index, {
                                required:
                                  e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-white/20 bg-black/30 accent-purple-500"
                          />

                          <div>
                            <p className="text-sm font-medium text-gray-300">
                              Required skill
                            </p>

                            <p className="text-xs text-gray-600">
                              Candidates should have this skill
                              to be considered a strong match.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5 text-sm text-red-300">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Publish */}
            <section className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.07] to-indigo-500/[0.04] p-6 sm:p-8">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Ready to publish?
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your opportunity and skill requirements
                  will be added to the SkillSetu marketplace.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-600
                  to-indigo-600
                  px-6
                  py-4
                  text-sm
                  font-semibold
                  shadow-xl
                  shadow-purple-600/20
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:from-purple-500
                  hover:to-indigo-500
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:translate-y-0
                "
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Opportunity...
                  </>
                ) : (
                  <>
                    Create Opportunity
                    <span>→</span>
                  </>
                )}
              </button>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}

