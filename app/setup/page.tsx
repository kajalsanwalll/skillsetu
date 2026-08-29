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
    accent: "#E8598B",
  },
  {
    id: "INDUSTRY" as Role,
    icon: "🏢",
    title: "Industry",
    description:
      "Create opportunities, define real-world skill requirements, and find students who match your needs.",
    accent: "#F4A93B",
  },
];

export default function SetupPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeAccent =
    roles.find((role) => role.id === selectedRole)?.accent ??
    "#F4A93B";

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
        throw new Error(
          data.error || "Failed to complete setup"
        );
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
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] font-sans flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9AA3C0] mb-4">
            Setu — the point where a bridge is built
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight mb-4">
            Welcome to Skill<span className="text-[#F4A93B]">Setu</span>
          </h1>

          <p className="text-[#C7CCE0] max-w-2xl mx-auto">
            Tell us how you want to use SkillSetu so we can
            personalize your experience.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                style={
                  isSelected
                    ? {
                        borderColor: `${role.accent}80`,
                        backgroundColor: `${role.accent}14`,
                        boxShadow: `0 0 0 1px ${role.accent}26, 0 0 40px 4px ${role.accent}1f`,
                      }
                    : undefined
                }
                className={`
                  text-left rounded-2xl border p-8
                  transition-all duration-200
                  ${
                    isSelected
                      ? ""
                      : "border-[#232B47] bg-[#171E33]/60 hover:border-[#3A4266] hover:bg-[#171E33]"
                  }
                `}
              >
                {/* Eyebrow dot, echoes the homepage pillars */}
                <div className="flex items-center gap-2 mb-6">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: role.accent }}
                  />
                  <span className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
                    {role.id}
                  </span>
                </div>

                {/* Icon */}
                <div className="text-5xl mb-6">
                  {role.icon}
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl mb-3">
                  {role.title}
                </h2>

                {/* Description */}
                <p className="text-[#C7CCE0] leading-7">
                  {role.description}
                </p>

                {/* Selected indicator */}
                <div className="mt-6 flex items-center gap-3">
                  <div
                    style={
                      isSelected
                        ? {
                            borderColor: role.accent,
                            backgroundColor: role.accent,
                          }
                        : undefined
                    }
                    className={`
                      w-5 h-5 rounded-full border
                      flex items-center justify-center
                      ${
                        isSelected
                          ? ""
                          : "border-[#3A4266]"
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#0F1526]" />
                    )}
                  </div>

                  <span className="text-sm text-[#9AA3C0]">
                    {isSelected
                      ? "Selected"
                      : "Select this role"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-[#E8598B]/30 bg-[#E8598B]/10 px-4 py-3 text-sm text-[#F3AFC6]">
            {error}
          </div>
        )}

        {/* Continue */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            style={
              selectedRole
                ? { backgroundColor: activeAccent }
                : undefined
            }
            className={`
              min-w-[220px]
              rounded-xl
              px-8 py-4
              font-medium text-[#0F1526]
              transition
              disabled:cursor-not-allowed
              disabled:opacity-30
              ${!selectedRole ? "bg-[#F4A93B]" : ""}
            `}
          >
            {loading ? "Setting up…" : "Continue"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-[11px] text-[#5B6386] mt-8">
          You can continue once you select your role.
        </p>
      </div>

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
    </main>
  );
}