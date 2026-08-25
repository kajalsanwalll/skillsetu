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

    const syncUser = async () => {
      try {
        const response = await fetch("/api/users/sync", {
          method: "POST",
        });

        if (!response.ok) {
          console.error("Failed to sync user");
          return;
        }

        const data = await response.json();

        console.log("SkillSetu user:", data.user);

        router.push("/student/dashboard");
      } catch (error) {
        console.error("Sync error:", error);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, router]);

  return null;
}