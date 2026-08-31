"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CandidateSkill = {
  id: string;
  proficiency: number;
  competencyLevel: string | null;
  verificationStrength: string;
  skill: {
    id: string;
    name: string;
    category: string | null;
  };
};

type Candidate = {
  id: string;
  careerInterest: string | null;
  bio: string | null;

  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };

  skills: CandidateSkill[];

  evidence: {
    id: string;
    title: string;
    type: string;
    verified: boolean;
  }[];

  assessments: {
    id: string;
    title: string;
    score: number;
  }[];

  academicCredentials: {
    id: string;
    title: string;
    source: string;
    verified: boolean;
  }[];

  applications: {
    id: string;
    opportunityId: string;
    matchScore: number | null;
    status: string;
    createdAt: string;
  }[];
};

const TEAL = "#2BA792";
const MARIGOLD = "#F4A93B";
const ROSE = "#E8598B";

function levelColor(level: string | null) {
  switch (level) {
    case "EXPERT":
      return TEAL;
    case "ADVANCED":
      return "#6FD6C4";
    case "INTERMEDIATE":
      return MARIGOLD;
    case "FOUNDATIONAL":
      return "#C7CCE0";
    case "EXPOSURE":
      return ROSE;
    default:
      return "#9AA3C0";
  }
}

function verificationColor(strength: string) {
  switch (strength) {
    case "HIGH":
      return TEAL;
    case "MEDIUM":
      return MARIGOLD;
    case "LOW":
      return ROSE;
    default:
      return "#9AA3C0";
  }
}

export default function IndustryCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await fetch(
          "/api/industry/candidates"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load candidates."
          );
        }

        setCandidates(data.candidates || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load candidates."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.user.name
          .toLowerCase()
          .includes(query) ||
        candidate.user.email
          .toLowerCase()
          .includes(query) ||
        candidate.careerInterest
          ?.toLowerCase()
          .includes(query) ||
        candidate.skills.some((skill) =>
          skill.skill.name
            .toLowerCase()
            .includes(query)
        );

      const matchesLevel =
        selectedLevel === "ALL" ||
        candidate.skills.some(
          (skill) =>
            skill.competencyLevel === selectedLevel
        );

      return matchesSearch && matchesLevel;
    });
  }, [candidates, search, selectedLevel]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#9AA3C0]">
            Loading candidates...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <Link
              href="/industry"
              className="text-sm text-[#9AA3C0] hover:text-[#F5F1E8] transition"
            >
              ← Industry Dashboard
            </Link>

            <p className="text-sm text-[#F4A93B] mt-6 mb-2">
              TALENT
            </p>

            <h1 className="text-4xl font-bold">
              Candidates
            </h1>

            <p className="text-[#9AA3C0] mt-2">
              Discover students based on verified,
              real-world skills.
            </p>
          </div>

          <div className="rounded-xl border border-[#232B47] bg-[#171E33]/60 px-5 py-3">
            <span className="text-2xl font-bold text-[#F4A93B]">
              {candidates.length}
            </span>
            <span className="text-sm text-[#9AA3C0] ml-2">
              candidates
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-5 text-[#f083a8]">
            {error}
          </div>
        )}

        {/* Search + Filter */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, career interest, or skill..."
              className="flex-1 rounded-xl border border-[#232B47] bg-[#0F1526] px-4 py-3 text-sm text-[#F5F1E8] outline-none placeholder:text-[#5B6488] focus:border-[#F4A93B]/50"
            />

            <select
              value={selectedLevel}
              onChange={(event) =>
                setSelectedLevel(event.target.value)
              }
              className="rounded-xl border border-[#232B47] bg-[#0F1526] px-4 py-3 text-sm text-[#F5F1E8] outline-none"
            >
              <option value="ALL">
                All Skill Levels
              </option>
              <option value="EXPOSURE">
                Exposure
              </option>
              <option value="FOUNDATIONAL">
                Foundational
              </option>
              <option value="INTERMEDIATE">
                Intermediate
              </option>
              <option value="ADVANCED">
                Advanced
              </option>
              <option value="EXPERT">
                Expert
              </option>
            </select>
          </div>
        </section>

        {/* Results */}
        {filteredCandidates.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-[#232B47] p-12 text-center">
            <div className="text-4xl mb-4">
              👤
            </div>

            <h2 className="text-lg font-semibold">
              No candidates found
            </h2>

            <p className="text-[#9AA3C0] mt-2">
              Try changing your search or skill-level
              filter.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                  {/* Candidate info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">
                      {candidate.user.name}
                    </h2>

                    <p className="text-sm text-[#9AA3C0] mt-1">
                      {candidate.user.email}
                    </p>

                    {candidate.careerInterest && (
                      <p className="text-sm text-[#F4A93B] mt-3">
                        {candidate.careerInterest}
                      </p>
                    )}

                    {candidate.bio && (
                      <p className="text-sm text-[#9AA3C0] mt-3 line-clamp-2">
                        {candidate.bio}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 shrink-0">
                    <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/60 px-4 py-3 text-center">
                      <p className="text-lg font-bold">
                        {candidate.skills.length}
                      </p>
                      <p className="text-xs text-[#9AA3C0]">
                        Skills
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/60 px-4 py-3 text-center">
                      <p className="text-lg font-bold">
                        {candidate.evidence.length}
                      </p>
                      <p className="text-xs text-[#9AA3C0]">
                        Evidence
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#232B47] bg-[#0F1526]/60 px-4 py-3 text-center">
                      <p className="text-lg font-bold">
                        {candidate.assessments.length}
                      </p>
                      <p className="text-xs text-[#9AA3C0]">
                        Assessments
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-[#232B47]">
                    <p className="text-xs text-[#9AA3C0] mb-3">
                      Skill DNA
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {candidate.skills
                        .slice(0, 8)
                        .map((studentSkill) => {
                          const color = levelColor(
                            studentSkill.competencyLevel
                          );

                          return (
                            <div
                              key={studentSkill.id}
                              className="rounded-lg border border-[#232B47] bg-[#0F1526]/60 px-3 py-2"
                            >
                              <span className="text-sm">
                                {studentSkill.skill.name}
                              </span>

                              {studentSkill.competencyLevel && (
                                <span
                                  className="ml-2 text-xs font-medium"
                                  style={{
                                    color,
                                  }}
                                >
                                  {studentSkill.competencyLevel}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-5 border-t border-[#232B47] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills
                      .filter(
                        (skill) =>
                          skill.verificationStrength !==
                          "UNVERIFIED"
                      )
                      .slice(0, 3)
                      .map((skill) => (
                        <span
                          key={`verified-${skill.id}`}
                          className="rounded-full border px-3 py-1 text-xs"
                          style={{
                            borderColor: `${verificationColor(
                              skill.verificationStrength
                            )}40`,
                            color: verificationColor(
                              skill.verificationStrength
                            ),
                          }}
                        >
                          ✓ {skill.skill.name} verified
                        </span>
                      ))}
                  </div>

                  <Link
                    href={`/industry/candidates/${candidate.id}`}
                    className="rounded-xl bg-[#F4A93B] px-5 py-3 text-sm font-semibold text-[#0F1526] hover:bg-[#f6bd6a] transition text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}