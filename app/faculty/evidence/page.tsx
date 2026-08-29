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
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
        <div className="mx-auto max-w-7xl">
          <p className="text-[#9AA3C0]">
            Loading evidence for review…
          </p>
        </div>
        <ThemeStyles />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4A93B]">
            Evidence review
          </p>

          <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-normal tracking-tight">
            Verify Student Skills
          </h1>

          <p className="mt-3 max-w-2xl text-[#C7CCE0]">
            Review submitted evidence and determine
            how strongly it supports the skills claimed by the student.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-4 text-sm text-[#F3AFC6]">
            {error}
          </div>
        )}

        {/* Empty state */}
        {evidence.length === 0 ? (
          <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-12 text-center">
            <h2 className="font-serif text-2xl">
              No pending evidence
            </h2>

            <p className="mt-2 text-sm text-[#9AA3C0]">
              All submitted evidence has been reviewed.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {evidence.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6"
              >
                {/* Student + Skill */}
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#F4A93B]/30 bg-[#F4A93B]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-[#F4A93B]">
                        {item.type.replaceAll(
                          "_",
                          " "
                        )}
                      </span>

                      <span className="rounded-full border border-[#232B47] bg-[#0F1526]/60 px-3 py-1 text-xs text-[#C7CCE0]">
                        {item.skill.name}
                      </span>
                    </div>

                    <h2 className="mt-4 font-serif text-2xl">
                      {item.title}
                    </h2>

                    <div className="mt-3">
                      <p className="font-medium text-[#F5F1E8]">
                        {item.student.name}
                      </p>

                      <p className="text-sm text-[#9AA3C0]">
                        {item.student.email}
                      </p>
                    </div>

                    {item.description && (
                      <p className="mt-5 leading-7 text-[#C7CCE0]">
                        {item.description}
                      </p>
                    )}

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-medium text-[#E8598B] underline underline-offset-4 hover:text-[#F3AFC6] transition"
                      >
                        Open Evidence →
                      </a>
                    )}
                  </div>

                  {/* Score */}
                  {item.score !== null && (
                    <div className="shrink-0 rounded-xl border border-[#F4A93B]/25 bg-[#F4A93B]/10 px-5 py-4 text-center">
                      <p className="font-serif text-2xl text-[#F4A93B]">
                        {item.score}%
                      </p>

                      <p className="font-mono text-[11px] uppercase tracking-wide text-[#9AA3C0]">
                        Submitted Score
                      </p>
                    </div>
                  )}
                </div>

                {/* Review controls */}
                <div className="mt-6 border-t border-[#232B47] pt-5">

                  <p className="text-sm font-semibold text-[#F5F1E8]">
                    Verification Decision
                  </p>

                  <p className="mt-1 text-xs text-[#9AA3C0]">
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
                      className="rounded-xl border border-[#2BA792]/40 bg-[#2BA792]/10 px-5 py-3 text-sm font-semibold text-[#2BA792] transition hover:bg-[#2BA792]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingId === item.id
                        ? "Updating…"
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
                      className="rounded-xl border border-[#F4A93B]/40 bg-[#F4A93B]/10 px-5 py-3 text-sm font-semibold text-[#F4A93B] transition hover:bg-[#F4A93B]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="rounded-xl border border-[#3A4266] bg-[#0F1526]/60 px-5 py-3 text-sm font-semibold text-[#9AA3C0] transition hover:bg-[#171E33] disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="rounded-xl border border-[#E8598B]/40 bg-[#E8598B]/10 px-5 py-3 text-sm font-semibold text-[#E8598B] transition hover:bg-[#E8598B]/20 disabled:cursor-not-allowed disabled:opacity-50"
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