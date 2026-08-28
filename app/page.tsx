
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[-150px] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute bottom-[-250px] right-[-150px] h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[130px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        {/* Navbar */}
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition hover:opacity-80"
          >
            skill<span className="text-purple-400">setu</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 hover:shadow-purple-500/30"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-1 items-center justify-center py-20">
          <div className="w-full max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
              AI-POWERED SKILL INTELLIGENCE
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Connect Skills.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                Create Opportunities.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
              SkillSetu connects industry demand, student capabilities, and
              academia through intelligent skill matching — helping people
              discover the right opportunities and build the skills they need.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-purple-600/20 transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-purple-500/30"
              >
                Get Started
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/sign-in"
                className="flex min-w-[160px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-semibold text-gray-300 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Sign In
              </Link>
            </div>

            {/* Feature cards */}
            <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-purple-500/20 hover:bg-white/[0.05]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-lg">
                  🎓
                </div>

                <h3 className="font-semibold">For Students</h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Discover opportunities and understand your skill gaps.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-purple-500/20 hover:bg-white/[0.05]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-lg">
                  🏢
                </div>

                <h3 className="font-semibold">For Industry</h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Find talent based on real-world skills and requirements.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-purple-500/20 hover:bg-white/[0.05]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-lg">
                  ✦
                </div>

                <h3 className="font-semibold">Intelligent Matching</h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Match skills with opportunities using AI-powered insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
          SkillSetu · Connecting talent, skills & opportunity
        </footer>
      </div>
    </main>
  );
}

