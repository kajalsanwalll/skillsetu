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
  },
  {
    id: "INDUSTRY" as Role,
    icon: "🏢",
    title: "Industry",
    description:
      "Create opportunities, define real-world skill requirements, and find students who match your needs.",
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
    <main className="min-h-screen bg-[#0b0b0f] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl font-bold tracking-tight mb-3">
            skillsetu
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Welcome to SkillSetu
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto">
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
                className={`
                  text-left rounded-2xl border p-8
                  transition-all duration-200
                  ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }
                `}
              >
                {/* Icon */}
                <div className="text-5xl mb-6">
                  {role.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold mb-3">
                  {role.title}
                </h2>

                {/* Description */}
                <p className="text-gray-400 leading-7">
                  {role.description}
                </p>

                {/* Selected indicator */}
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`
                      w-5 h-5 rounded-full border
                      flex items-center justify-center
                      ${
                        isSelected
                          ? "border-purple-500 bg-purple-500"
                          : "border-gray-600"
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  <span className="text-sm text-gray-400">
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
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Continue */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="
              min-w-[220px]
              rounded-xl
              bg-purple-600
              px-8
              py-4
              font-semibold
              transition
              hover:bg-purple-500
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {loading ? "Setting up..." : "Continue"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-8">
          You can continue once you select your role.
        </p>
      </div>
    </main>
  );
}