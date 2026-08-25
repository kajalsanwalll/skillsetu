"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const { isLoaded, isSignedIn } = useAuth();

  const [message, setMessage] = useState("");
  const router = useRouter();

  async function initialize() {
    setMessage("Setting up your Skill DNA...");

    try {
      const response = await fetch(
        "/api/skills/seed",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to seed skills");
      }

      const skillResponse = await fetch(
        "/api/student/skill-dna/initialize",
        {
          method: "POST",
        }
      );

      if (!skillResponse.ok) {
        throw new Error(
          "Failed to initialize Skill DNA"
        );
      }

      setMessage("Skill DNA created!");

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 800);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  }

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Please sign in first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-5">
        <h1 className="text-3xl font-bold">
          Set up SkillSetu
        </h1>

        <p className="text-gray-500">
          Initialize your Skill DNA for development.
        </p>

        <button
          onClick={initialize}
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          Initialize Skill DNA
        </button>

        {message && (
          <p className="text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}