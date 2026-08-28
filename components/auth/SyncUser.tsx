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

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to sync user:",
            data.error
          );
          return;
        }

        console.log("SkillSetu user:", data.user);
        console.log("User exists:", data.userExists);

        // -----------------------------------------
        // NEW USER
        // -----------------------------------------
        if (!data.userExists) {
          router.push("/setup");
          return;
        }

        // -----------------------------------------
        // EXISTING USER
        // -----------------------------------------
        const role = data.user?.role;

        if (role === "STUDENT") {
          router.push("/student/dashboard");
          return;
        }

        if (role === "INDUSTRY") {
          router.push("/industry");
          return;
        }

        if (role === "FACULTY") {
          router.push("/academy");
          return;
        }

        // -----------------------------------------
        // Unknown / invalid role
        // -----------------------------------------
        console.error(
          "Unknown SkillSetu role:",
          role
        );
      } catch (error) {
        console.error("Sync error:", error);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, router]);

  return null;
}