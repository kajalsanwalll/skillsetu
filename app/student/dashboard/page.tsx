
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    include: {
      studentProfile: {
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.studentProfile) {
    redirect("/setup");
  }

  const skills = user.studentProfile.skills;

  const averageSkill =
    skills.length > 0
      ? Math.round(
          skills.reduce(
            (sum, skill) => sum + skill.proficiency,
            0
          ) / skills.length
        )
      : 0;

  const strongSkills = skills
    .filter((skill) => skill.proficiency >= 75)
    .sort((a, b) => b.proficiency - a.proficiency);

  const improvementSkills = skills
    .filter((skill) => skill.proficiency < 60)
    .sort((a, b) => a.proficiency - b.proficiency);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] px-5 py-8 text-white sm:px-8 lg:px-10">

      {/* ============================================
          BACKGROUND
      ============================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[140px]" />

        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/[0.025] blur-[120px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8">

        {/* ============================================
            HEADER
        ============================================ */}

        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>

            {/* Brand */}

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <span className="text-lg font-bold">
                  S
                </span>
              </div>

              <span className="text-lg font-semibold tracking-tight">
                SkillSetu
              </span>
            </div>

            {/* Label */}

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-500/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              STUDENT DASHBOARD
            </div>

            {/* Heading */}

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {user.name.split(" ")[0]}
              </span>{" "}
              👋
            </h1>

            <p className="mt-3 text-sm leading-7 text-gray-400 sm:text-base">
              Here&apos;s where you stand today.
            </p>

          </div>

          {/* Profile status */}

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 backdrop-blur-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold">
              {user.name
                .split(" ")
                .map((name) => name[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-200">
                {user.name}
              </p>

              <p className="mt-0.5 text-xs text-emerald-400">
                Profile active
              </p>
            </div>

          </div>

        </section>

        {/* ============================================
            READINESS STATS
        ============================================ */}

        <section className="grid gap-4 md:grid-cols-3">

          <DashboardStatCard
            label="Career Readiness"
            value={`${averageSkill}%`}
            description="Based on your current Skill DNA"
            icon="✦"
            highlight
          />

          <DashboardStatCard
            label="Strong Skills"
            value={strongSkills.length}
            description="Skills above 75%"
            icon="✓"
          />

          <DashboardStatCard
            label="Skills to Improve"
            value={improvementSkills.length}
            description="Skills below 60%"
            icon="↗"
          />

        </section>

        {/* ============================================
            SKILL DNA
        ============================================ */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-black/10 sm:p-7">

          {/* Glow */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/[0.06] blur-3xl" />

          <div className="relative">

            {/* Section header */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

              <div>

                <div className="mb-3 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/10">
                    <span className="text-lg">🧬</span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Your Skill DNA
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Your current capability profile
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-gray-500">
                {skills.length}{" "}
                {skills.length === 1 ? "skill" : "skills"} tracked
              </div>

            </div>

            {/* Skills */}

            {skills.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.04] text-2xl">
                  🧬
                </div>

                <p className="font-medium text-gray-300">
                  No skills added yet
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Add skills to start building your Skill DNA.
                </p>

              </div>
            ) : (
              <div className="mt-8 space-y-6">

                {skills
                  .sort(
                    (a, b) =>
                      b.proficiency - a.proficiency
                  )
                  .map((studentSkill) => (
                    <div key={studentSkill.id}>

                      <div className="mb-2.5 flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <span className="text-sm font-medium text-gray-200">
                            {studentSkill.skill.name}
                          </span>

                          {studentSkill.proficiency >= 75 && (
                            <span className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              Strong
                            </span>
                          )}

                        </div>

                        <span className="text-sm font-semibold text-gray-400">
                          {studentSkill.proficiency}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                          style={{
                            width: `${studentSkill.proficiency}%`,
                          }}
                        />

                      </div>

                    </div>
                  ))}

              </div>
            )}

          </div>
        </section>

        {/* ============================================
            IMPROVEMENT
        ============================================ */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-black/10 sm:p-7">

          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-500/[0.05] blur-3xl" />

          <div className="relative">

            {/* Header */}

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/10 bg-purple-500/10">
                <span className="text-lg">🎯</span>
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Skills to Improve
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  These are your biggest current gaps.
                </p>
              </div>

            </div>

            {/* Improvement cards */}

            {improvementSkills.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] p-8 text-center">

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  ✓
                </div>

                <p className="font-medium text-emerald-300">
                  You&apos;re doing great!
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  You currently have no skills below the 60% threshold.
                </p>

              </div>
            ) : (
              <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {improvementSkills.map(
                  (studentSkill) => (
                    <div
                      key={studentSkill.id}
                      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/20 hover:bg-white/[0.04]"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="font-semibold text-gray-200">
                          {studentSkill.skill.name}
                        </h3>

                        <span className="rounded-lg border border-red-500/10 bg-red-500/[0.06] px-2.5 py-1 text-xs font-semibold text-red-300">
                          {studentSkill.proficiency}%
                        </span>

                      </div>

                      {/* Mini progress */}

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-500/70 to-purple-500/70"
                          style={{
                            width: `${studentSkill.proficiency}%`,
                          }}
                        />

                      </div>

                      <p className="mt-4 text-sm text-gray-500">
                        Needs improvement
                      </p>

                      <button className="mt-4 flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                        View recommended action
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}

/* =============================================
   DASHBOARD STAT CARD
============================================= */

function DashboardStatCard({
  label,
  value,
  description,
  icon,
  highlight = false,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
        highlight
          ? "border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.10] to-purple-500/[0.04] shadow-lg shadow-indigo-500/5"
          : "border-white/10 bg-white/[0.025] hover:border-indigo-500/15 hover:bg-white/[0.04]"
      }`}
    >

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/[0.05] blur-3xl transition-all group-hover:bg-indigo-500/[0.1]" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <p
            className={`mt-3 text-4xl font-bold tracking-tight ${
              highlight
                ? "bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
                : "text-white"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm ${
            highlight
              ? "border-indigo-400/10 bg-indigo-500/10 text-indigo-300"
              : "border-white/10 bg-white/[0.04] text-gray-400"
          }`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

