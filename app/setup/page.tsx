
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "STUDENT" | "INDUSTRY";

const roles = [
  {
    id: "STUDENT" as Role,
    icon: "🎓",
    title: "Student",
    description:
      "Build your Skill DNA, discover opportunities, identify skill gaps, and create a personalized career roadmap.",
    features: [
      "Build your Skill DNA",
      "Discover relevant opportunities",
      "Identify skill gaps",
    ],
  },
  {
    id: "INDUSTRY" as Role,
    icon: "🏢",
    title: "Industry",
    description:
      "Create opportunities, define real-world skill requirements, and find students who match your needs.",
    features: [
      "Create real-world opportunities",
      "Define skill requirements",
      "Find matching student talent",
    ],
  },
];

export default function SetupPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    if (!selectedRole) {
      setError("Please select how you want to use SkillSetu.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete setup");
      }

      // Redirect based on role
      if (selectedRole === "STUDENT") {
        router.push("/student/dashboard");
      } else {
        router.push("/industry");
      }

      router.refresh();
    } catch (err) {
      console.error("SETUP_ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Indigo glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[130px]" />

        {/* Purple glow */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[130px]" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.03] blur-[120px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">

        {/* ================= TOP BAR ================= */}

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <span className="text-lg font-bold">S</span>
            </div>

            <span className="text-xl font-semibold tracking-tight">
              SkillSetu
            </span>
          </div>

          <div className="hidden text-sm text-gray-500 sm:block">
            Step <span className="text-gray-300">1</span> of 1
          </div>
        </header>

        {/* ================= MAIN ================= */}

        <div className="flex flex-1 flex-col justify-center py-12">

          {/* Heading */}

          <div className="mx-auto mb-12 max-w-2xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-400 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              Personalize your experience
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SkillSetu
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
              Tell us how you want to use SkillSetu. We&apos;ll personalize
              your experience based on your goals.
            </p>
          </div>

          {/* ================= ROLE CARDS ================= */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {roles.map((role) => {
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setError("");
                  }}
                  className={`group relative overflow-hidden rounded-3xl border p-7 text-left transition-all duration-300 sm:p-8 ${
                    isSelected
                      ? "border-indigo-500/70 bg-indigo-500/[0.08] shadow-2xl shadow-indigo-500/10"
                      : "border-white/10 bg-white/[0.025] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"
                  }`}
                >
                  {/* Selected glow */}

                  {isSelected && (
                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
                  )}

                  {/* Selection check */}

                  <div
                    className={`absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500"
                        : "border-white/15 bg-white/[0.03]"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Icon */}

                  <div
                    className={`mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl transition-all ${
                      isSelected
                        ? "border-indigo-400/30 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                        : "border-white/10 bg-white/[0.04] group-hover:bg-white/[0.07]"
                    }`}
                  >
                    {role.icon}
                  </div>

                  {/* Title */}

                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">
                      {role.title}
                    </h2>

                    {isSelected && (
                      <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Description */}

                  <p className="mt-3 min-h-[84px] text-sm leading-7 text-gray-400 sm:text-base">
                    {role.description}
                  </p>

                  {/* Features */}

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                    {role.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 text-sm text-gray-400"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                          <svg
                            className={`h-3 w-3 ${
                              isSelected
                                ? "text-indigo-400"
                                : "text-gray-500"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>

                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Bottom indicator */}

                  <div
                    className={`mt-7 flex items-center gap-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? "text-indigo-300"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  >
                    <span>
                      {isSelected
                        ? "Ready to continue"
                        : "Select this role"}
                    </span>

                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mx-auto mt-6 flex w-full max-w-2xl items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                !
              </div>

              {error}
            </div>
          )}

          {/* ================= CONTINUE ================= */}

          <div className="mt-8 flex flex-col items-center">

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedRole || loading}
              className={`group relative min-w-[240px] overflow-hidden rounded-xl px-8 py-4 font-semibold transition-all duration-300 ${
                selectedRole && !loading
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/30"
                  : "cursor-not-allowed bg-white/10 text-gray-500"
              }`}
            >
              {/* Button shine */}

              {selectedRole && !loading && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              )}

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Setting up...
                  </>
                ) : (
                  <>
                    Continue

                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>
                  </>
                )}
              </span>
            </button>

            <p className="mt-4 text-center text-xs text-gray-600">
              Your role helps us personalize your SkillSetu experience.
            </p>
          </div>
        </div>

        {/* ================= FOOTER ================= */}

        <footer className="pb-4 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SkillSetu · Built for skills,
            opportunities &amp; growth.
          </p>
        </footer>
      </div>
    </main>
  );
}

