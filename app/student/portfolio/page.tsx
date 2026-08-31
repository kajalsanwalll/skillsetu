"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";

type ExtractedSkill = {
  id: string;
  name: string;
  proficiency: number;
};

type ExtractedProject = {
  title: string;
  description: string | null;
};

type ExtractedExperience = {
  title: string;
  description: string | null;
  type: "INTERNSHIP" | "CERTIFICATION";
};

type ExtractionResult = {
  skills: ExtractedSkill[];
  projects: ExtractedProject[];
  experience: ExtractedExperience[];
};

export default function PortfolioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] =
    useState<ExtractionResult | null>(null);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please upload a PDF resume.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("Resume must be smaller than 10 MB.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(
        "/api/student/resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to analyze resume."
        );
      }

      setResult(data.extraction);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze resume."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* HEADER */}
        <section>
          <p className="text-sm font-medium tracking-wide text-[#F4A93B]">
            PORTFOLIO
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Build your SkillSetu profile.
          </h1>

          <p className="mt-2 max-w-2xl text-[#9AA3C0]">
            Upload your resume and SkillSetu will extract
            your skills, projects, and experience to help
            build your Skill DNA.
          </p>
        </section>

        {/* NAV */}
        <nav className="flex flex-wrap gap-2">
          {[
            {
              href: "/student/skill-dna",
              icon: "🧬",
              label: "Skill DNA",
            },
            {
              href: "/student/opportunities",
              icon: "🎯",
              label: "Opportunities",
            },
            {
              href: "/student/gaps",
              icon: "📈",
              label: "Skill Gaps",
            },
            {
              href: "/student/roadmap",
              icon: "🗺️",
              label: "Roadmap",
            },
            {
              href: "/student/assessment",
              icon: "📝",
              label: "Assessments",
            },
            {
              href: "/student/portfolio",
              icon: "🗂️",
              label: "Portfolio",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                item.href === "/student/portfolio"
                  ? "border-[#F4A93B]/50 bg-[#F4A93B]/10 text-[#F4A93B]"
                  : "border-[#232B47] bg-[#171E33]/60 text-[#C7CCE0] hover:border-[#F4A93B]/40 hover:text-[#F5F1E8]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* UPLOAD */}
        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-[#F4A93B]">
              RESUME IMPORT
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Start with your resume
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#9AA3C0]">
              Instead of manually entering every skill,
              upload your resume and let SkillSetu build
              your initial Skill DNA automatically.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-[#5B6488] bg-[#0F1526]/50 p-10 text-center">
            <div className="text-5xl">📄</div>

            <h3 className="mt-4 text-lg font-semibold">
              Upload your resume
            </h3>

            <p className="mt-2 text-sm text-[#9AA3C0]">
              PDF only · Maximum 10 MB
            </p>

            <label className="mt-6 inline-flex cursor-pointer rounded-xl border border-[#232B47] bg-[#171E33] px-5 py-3 text-sm font-medium text-[#C7CCE0] transition hover:border-[#F4A93B]/50 hover:text-[#F4A93B]">
              Choose PDF
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mx-auto mt-5 max-w-md rounded-xl border border-[#2BA792]/30 bg-[#2BA792]/10 p-4">
                <p className="truncate text-sm font-medium text-[#6fd6c4]">
                  ✓ {file.name}
                </p>

                <p className="mt-1 text-xs text-[#9AA3C0]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {error && (
              <div className="mx-auto mt-5 max-w-xl rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 p-4 text-sm text-[#f083a8]">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="mt-6 rounded-xl bg-[#F4A93B] px-6 py-3 text-sm font-semibold text-[#0F1526] transition hover:bg-[#f6bd6a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Analyzing your resume..."
                : "Analyze Resume →"}
            </button>

            {loading && (
              <p className="mt-4 text-xs text-[#9AA3C0]">
                Extracting skills, projects, and experience...
              </p>
            )}
          </div>
        </section>

        {/* RESULTS */}
        {result && (
          <section className="space-y-6">
            {/* SUCCESS */}
            <div className="rounded-2xl border border-[#2BA792]/30 bg-[#2BA792]/10 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[#6fd6c4]">
                    ✓ Resume analyzed successfully
                  </p>

                  <p className="mt-1 text-sm text-[#9AA3C0]">
                    Your extracted skills have been added
                    to your Skill DNA.
                  </p>
                </div>

                <div className="rounded-xl bg-[#2BA792]/10 px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-[#6fd6c4]">
                    {result.skills.length}
                  </p>
                  <p className="text-xs text-[#9AA3C0]">
                    Skills detected
                  </p>
                </div>
              </div>
            </div>

            {/* SKILLS */}
            <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7">
              <div>
                <h2 className="text-xl font-bold">
                  Skills detected
                </h2>

                <p className="mt-1 text-sm text-[#9AA3C0]">
                  These skills were extracted from your
                  resume and added to your Skill DNA.
                </p>
              </div>

              {result.skills.length === 0 ? (
                <p className="mt-6 text-sm text-[#9AA3C0]">
                  No skills were detected.
                </p>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-xl border border-[#232B47] bg-[#0F1526]/40 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">
                          {skill.name}
                        </p>

                        <span className="text-xs text-[#F4A93B]">
                          {Math.round(skill.proficiency)}%
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#F4A93B]"
                          style={{
                            width: `${Math.min(
                              skill.proficiency,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* PROJECTS */}
            <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7">
              <h2 className="text-xl font-bold">
                Projects
              </h2>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Projects detected from your resume.
              </p>

              {result.projects.length === 0 ? (
                <p className="mt-6 text-sm text-[#9AA3C0]">
                  No projects detected.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {result.projects.map(
                    (project, index) => (
                      <div
                        key={`${project.title}-${index}`}
                        className="rounded-xl border border-[#232B47] p-5"
                      >
                        <h3 className="font-semibold">
                          {project.title}
                        </h3>

                        {project.description && (
                          <p className="mt-2 text-sm leading-6 text-[#9AA3C0]">
                            {project.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* EXPERIENCE */}
            <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-7">
              <h2 className="text-xl font-bold">
                Experience & Certifications
              </h2>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Professional experience and
                certifications detected from your resume.
              </p>

              {result.experience.length === 0 ? (
                <p className="mt-6 text-sm text-[#9AA3C0]">
                  No experience or certifications detected.
                </p>
              ) : (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {result.experience.map(
                    (item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="rounded-xl border border-[#232B47] p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold">
                            {item.title}
                          </h3>

                          <span className="shrink-0 rounded-full bg-[#F4A93B]/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#F4A93B]">
                            {item.type}
                          </span>
                        </div>

                        {item.description && (
                          <p className="mt-2 text-sm leading-6 text-[#9AA3C0]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* NEXT STEP */}
            <section className="rounded-2xl border border-[#F4A93B]/20 bg-[#F4A93B]/[0.06] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold">
                    Your Skill DNA is ready.
                  </h2>

                  <p className="mt-1 text-sm text-[#9AA3C0]">
                    See how these skills affect your match
                    with real opportunities.
                  </p>
                </div>

                <Link
                  href="/student/skill-dna"
                  className="rounded-xl bg-[#F4A93B] px-5 py-3 text-center text-sm font-semibold text-[#0F1526] transition hover:bg-[#f6bd6a]"
                >
                  View Skill DNA →
                </Link>
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}