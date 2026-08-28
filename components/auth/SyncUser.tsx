"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SyncUser() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    async function syncUser() {
      try {
        const response = await fetch("/api/users/sync", {
          method: "POST",
        });

        const data = await response.json();

        console.log("SYNC STATUS:", response.status);
        console.log("SYNC RESPONSE:", data);

        if (!response.ok) {
          console.error("Failed to sync user:", data);
          return;
        }

        const user = data.user;

        console.log("SkillSetu user:", user);

        // Existing Student
        if (user?.role === "STUDENT") {
          router.replace("/student/dashboard");
          return;
        }

        // Existing Industry
        if (user?.role === "INDUSTRY") {
          router.replace("/industry");
          return;
        }

        // No role yet
        router.replace("/setup");
      } catch (error) {
        console.error("Sync error:", error);
      }
    }

    syncUser();
  }, [isLoaded, isSignedIn, router]);

  return null;
}