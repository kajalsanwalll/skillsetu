import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SyncUser from "@/components/auth/SyncUser";

export default async function OnboardingPage() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <>
      <SyncUser />

      <main className="min-h-screen flex items-center justify-center bg-[#0F1526] text-[#F5F1E8] font-sans px-6">
        <div className="text-center">

          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#3A4266] bg-[#171E33] font-serif text-lg text-[#F4A93B] setu-node">
            सेतु
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4A93B] mb-3">
            Setting up
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
            Building your SkillSetu profile
          </h1>

          <p className="mt-3 text-[#9AA3C0]">
            Just a moment — connecting your industry,
            student, and academic threads.
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

          .setu-node {
            box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.15),
              0 0 40px 6px rgba(244, 169, 59, 0.12);
            animation: setu-pulse 3.2s ease-in-out infinite;
          }

          @keyframes setu-pulse {
            0%, 100% {
              box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.15),
                0 0 40px 6px rgba(244, 169, 59, 0.12);
            }
            50% {
              box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.25),
                0 0 56px 10px rgba(244, 169, 59, 0.22);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .setu-node {
              animation: none;
            }
          }
        `}</style>
      </main>
    </>
  );
}