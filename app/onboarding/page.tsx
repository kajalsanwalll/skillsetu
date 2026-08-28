
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SyncUser from "@/components/auth/SyncUser";

export default async function OnboardingPage() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      <SyncUser />

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-left glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[130px]" />

        {/* Bottom-right glow */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[130px]" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.04] blur-[120px]" />

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

      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ================= HEADER ================= */}

        <header className="absolute left-0 right-0 top-0 px-6 py-7 sm:px-10">
          <div className="mx-auto flex max-w-6xl items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <span className="text-lg font-bold">S</span>
              </div>

              <span className="text-xl font-semibold tracking-tight">
                SkillSetu
              </span>
            </div>
          </div>
        </header>

        {/* ================= CENTER CONTENT ================= */}

        <div className="flex min-h-screen items-center justify-center px-6 py-24">

          <div className="w-full max-w-lg text-center">

            {/* Loading indicator */}

            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.08] shadow-xl shadow-indigo-500/10">
              <div className="relative flex h-10 w-10 items-center justify-center">

                {/* Outer spinner */}
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-400 border-r-purple-400" />

                {/* Inner dot */}
                <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg shadow-indigo-500/40" />
              </div>
            </div>

            {/* Status badge */}

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-400 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              Getting things ready
            </div>

            {/* Heading */}

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Setting up your{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SkillSetu
              </span>{" "}
              profile
            </h1>

            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-400">
              We&apos;re preparing your personalized experience.
              This will only take a moment.
            </p>

            {/* Progress container */}

            <div className="mx-auto mt-9 max-w-sm">

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>

              <div className="mt-3 flex justify-between text-xs text-gray-600">
                <span>Preparing profile</span>
                <span>Please wait...</span>
              </div>
            </div>

            {/* Info card */}

            <div className="mx-auto mt-10 flex max-w-md items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left backdrop-blur-sm">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg
                  className="h-4 w-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-8h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-300">
                  Almost there
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Your account is being connected to SkillSetu.
                  You&apos;ll be redirected automatically once everything
                  is ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}

        <footer className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SkillSetu · Built for skills,
            opportunities &amp; growth.
          </p>
        </footer>
      </div>
    </main>
  );
}

