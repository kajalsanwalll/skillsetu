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
      setError(
        "Every skill must have a name."
      );
      return;
    }

    if (opportunity.skills.length === 0) {
      setError(
        "At least one skill is required."
      );
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
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push("/industry")}
            className="text-sm text-gray-400 hover:text-white mb-5"
          >
            ← Back to Industry
          </button>

          <p className="text-sm text-purple-400 mb-2">
            INDUSTRY
          </p>

          <h1 className="text-4xl font-bold">
            Create Opportunity
          </h1>

          <p className="text-gray-400 mt-2">
            Paste a job or opportunity description and
            let SkillSetu extract the required skills.
          </p>
        </div>

        {/* JD Input */}
        {!opportunity && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <label className="block text-sm font-medium mb-3">
              Job / Opportunity Description
            </label>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the complete job description here..."
              className="
                w-full
                min-h-[350px]
                rounded-xl
                border border-white/10
                bg-black/30
                p-5
                text-white
                placeholder:text-gray-600
                outline-none
                focus:border-purple-500
                resize-y
              "
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
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
                mt-5
                w-full
                rounded-xl
                bg-purple-600
                px-6
                py-4
                font-semibold
                hover:bg-purple-500
                transition
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              {extracting
                ? "✨ Extracting requirements..."
                : "✨ Extract Requirements"}
            </button>
          </section>
        )}

        {/* Review */}
        {opportunity && (
          <div className="space-y-8">

            {/* Opportunity details */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Review Opportunity
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    AI extracted the following information.
                    Edit anything before publishing.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setOpportunity(null);
                    setError("");
                  }}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  ← Re-extract
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Title */}
                <div>
                  <label className="text-sm text-gray-400">
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
                      border border-white/10
                      bg-black/30
                      px-4
                      py-3
                      outline-none
                      focus:border-purple-500
                    "
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="text-sm text-gray-400">
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
                      border border-white/10
                      bg-black/30
                      px-4
                      py-3
                      outline-none
                      focus:border-purple-500
                    "
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm text-gray-400">
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
                      border border-white/10
                      bg-black/30
                      px-4
                      py-3
                      outline-none
                      focus:border-purple-500
                    "
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm text-gray-400">
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
                      border border-white/10
                      bg-black/30
                      px-4
                      py-3
                      outline-none
                      focus:border-purple-500
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
                <label className="text-sm text-gray-400">
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
                    w-full
                    min-h-[200px]
                    rounded-xl
                    border border-white/10
                    bg-black/30
                    p-4
                    outline-none
                    focus:border-purple-500
                    resize-y
                  "
                />
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Required Skills
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Review and adjust the AI-generated
                    requirements.
                  </p>
                </div>

                <button
                  onClick={addSkill}
                  className="
                    rounded-xl
                    border border-white/10
                    px-4
                    py-2
                    text-sm
                    hover:bg-white/5
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
                        rounded-xl
                        border border-white/10
                        bg-black/20
                        p-5
                      "
                    >

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Skill name */}
                        <div>
                          <label className="text-xs text-gray-500">
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
                              mt-1
                              w-full
                              rounded-lg
                              border border-white/10
                              bg-black/30
                              px-3
                              py-2
                              outline-none
                              focus:border-purple-500
                            "
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="text-xs text-gray-500">
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
                              mt-1
                              w-full
                              rounded-lg
                              border border-white/10
                              bg-black/30
                              px-3
                              py-2
                              outline-none
                              focus:border-purple-500
                            "
                          />
                        </div>

                        {/* Proficiency */}
                        <div>
                          <label className="text-xs text-gray-500">
                            Minimum Proficiency:{" "}
                            {skill.minimumProficiency}
                          </label>

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
                            className="mt-3 w-full"
                          />
                        </div>

                        {/* Weight */}
                        <div>
                          <label className="text-xs text-gray-500">
                            Weight:{" "}
                            {skill.weight.toFixed(2)}
                          </label>

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
                            className="mt-3 w-full"
                          />
                        </div>

                      </div>

                      {/* Required + delete */}
                      <div className="flex items-center justify-between mt-5">

                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={skill.required}
                            onChange={(e) =>
                              updateSkill(index, {
                                required:
                                  e.target.checked,
                              })
                            }
                          />

                          Required skill
                        </label>

                        <button
                          onClick={() =>
                            removeSkill(index)
                          }
                          className="text-sm text-red-400 hover:text-red-300"
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
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="
                w-full
                rounded-xl
                bg-purple-600
                px-6
                py-4
                font-semibold
                text-lg
                hover:bg-purple-500
                transition
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              {saving
                ? "Creating Opportunity..."
                : "Create Opportunity"}
            </button>

          </div>
        )}

      </div>
    </main>
  );
}