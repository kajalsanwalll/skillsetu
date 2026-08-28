"use client";

import { useEffect, useState } from "react";

type Evidence = {
  id: string;

  student: {
    id: string;
    name: string;
    email: string;
  };

  skill: {
    id: string;
    name: string;
    category: string | null;
  };

  type: string;
  title: string;
  description: string | null;
  url: string | null;
  score: number | null;

  verified: boolean;
  verificationStrength: string;

  createdAt: string;
};

export default function FacultyEvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] =
    useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, []);

  async function loadEvidence() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/reviewer/evidence"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load evidence."
        );
      }

      setEvidence(data.evidence || []);
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

  async function reviewEvidence(
    id: string,
    strength:
      | "HIGH"
      | "MEDIUM"
      | "LOW"
      | "UNVERIFIED"
  ) {
    try {
      setReviewingId(id);
      setError("");

      const response = await fetch(
        `/api/student/evidence/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verified: strength !== "UNVERIFIED",
            verificationStrength: strength,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update verification."
        );
      }

      // Remove reviewed evidence from pending list
      setEvidence((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update verification."
      );
    } finally {
      setReviewingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-500">
            Loading evidence for review...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section>
          <p className="text-sm font-medium text-purple-600">
            EVIDENCE REVIEW
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Verify Student Skills
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Review submitted evidence and determine
            how strongly it supports the skills claimed by the student.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {evidence.length === 0 ? (
          <section className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No pending evidence
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              All submitted evidence has been reviewed.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {evidence.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                {/* Student + Skill */}
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                        {item.type.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {item.skill.name}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-bold">
                      {item.title}
                    </h2>

                    <div className="mt-2">
                      <p className="font-medium">
                        {item.student.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.student.email}
                      </p>
                    </div>

                    {item.description && (
                      <p className="mt-5 leading-7 text-gray-600">
                        {item.description}
                      </p>
                    )}

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-medium text-blue-600 underline"
                      >
                        Open Evidence →
                      </a>
                    )}
                  </div>

                  {/* Score */}
                  {item.score !== null && (
                    <div className="shrink-0 rounded-xl bg-gray-50 px-5 py-4 text-center">
                      <p className="text-2xl font-bold">
                        {item.score}%
                      </p>

                      <p className="text-xs text-gray-500">
                        Submitted Score
                      </p>
                    </div>
                  )}
                </div>

                {/* Review controls */}
                <div className="mt-6 border-t border-gray-100 pt-5">

                  <p className="text-sm font-semibold">
                    Verification Decision
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Select how strongly this evidence
                    supports the skills claimed by the student.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">

                    {/* HIGH */}
                    <button
                      type="button"
                      disabled={
                        reviewingId === item.id
                      }
                      onClick={() =>
                        reviewEvidence(
                          item.id,
                          "HIGH"
                        )
                      }
                      className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingId === item.id
                        ? "Updating..."
                        : "✓ Verify — High"}
                    </button>

                    {/* MEDIUM */}
                    <button
                      type="button"
                      disabled={
                        reviewingId === item.id
                      }
                      onClick={() =>
                        reviewEvidence(
                          item.id,
                          "MEDIUM"
                        )
                      }
                      className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Verify — Medium
                    </button>

                    {/* LOW */}
                    <button
                      type="button"
                      disabled={
                        reviewingId === item.id
                      }
                      onClick={() =>
                        reviewEvidence(
                          item.id,
                          "LOW"
                        )
                      }
                      className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-3 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Verify — Low
                    </button>

                    {/* REJECT */}
                    <button
                      type="button"
                      disabled={
                        reviewingId === item.id
                      }
                      onClick={() =>
                        reviewEvidence(
                          item.id,
                          "UNVERIFIED"
                        )
                      }
                      className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>

                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

      </div>
    </main>
  );
}