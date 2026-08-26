"use client";

import { useState } from "react";

export default function NewOpportunityPage() {
  const [jobDescription, setJobDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false); 

  const [result, setResult] =
    useState<any>(null);

  const [error, setError] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);   

  async function extractSkills() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/api/industry/extract",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Extraction failed"
        );
      }

      setResult(data.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveOpportunity() {
  if (!result) return;

  setSaving(true);
  setError("");

  try {
    const response = await fetch(
      "/api/industry/opportunities",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ?? "Failed to save opportunity"
      );
    }

    setSaved(true);

    console.log(
      "CREATED OPPORTUNITY:",
      data.opportunity
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to save opportunity"
    );
  } finally {
    setSaving(false);
  }
}

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">

        <div>
          <p className="text-sm font-medium text-blue-600">
            INDUSTRY
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Create Opportunity
          </h1>

          <p className="mt-2 text-gray-500">
            Paste a job description and SkillSetu will
            extract the required skills.
          </p>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <label className="font-semibold">
            Job Description
          </label>

          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(e.target.value)
            }
            placeholder="Paste the job description here..."
            className="mt-3 min-h-64 w-full rounded-xl border p-4 outline-none focus:ring-2"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={extractSkills}
            disabled={
              loading ||
              jobDescription.length < 50
            }
            className="mt-5 rounded-xl bg-black px-6 py-3 text-white disabled:opacity-40"
          >
            {loading
              ? "Analyzing..."
              : "Extract Skills →"}
          </button>

        </section>

        {result && (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

            <div>
              <p className="text-sm text-gray-500">
                AI ANALYSIS
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {result.title}
              </h2>
            </div>

            <div className="mt-6 space-y-4">

              {result.skills.map(
                (skill: any) => (
                  <div
                    key={skill.name}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex justify-between">

                      <div>
                        <p className="font-semibold">
                          {skill.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {skill.category}
                        </p>
                      </div>

                      <span className="text-sm">
                        {skill.required
                          ? "Required"
                          : "Nice to have"}
                      </span>

                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span>
                          Minimum proficiency
                        </span>

                        <span>
                          {skill.minimumProficiency}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{
                            width: `${skill.minimumProficiency}%`,
                          }}
                        />
                      </div>
                    </div>

                  </div>
                )
              )}

            </div>

            <button
             onClick={saveOpportunity}
             disabled={saving || saved}
             className="mt-6 rounded-xl bg-black px-6 py-3 text-white disabled:opacity-50"
              >
              {saved
               ? "✓ Opportunity Saved"
                : saving
               ? "Saving..."
                : "Save Opportunity →"}
            </button>

          </section>
        )}

      </div>
    </main>
  );
}