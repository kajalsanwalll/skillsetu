
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  // -----------------------------------------
  // 1. Authenticate
  // -----------------------------------------
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect("/sign-in");
  }

  // -----------------------------------------
  // 2. Fetch SkillSetu user + profile
  // -----------------------------------------
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
          applications: {
            include: {
              opportunity: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
        },
      },
    },
  });

  // -----------------------------------------
  // 3. Student must have a profile
  // -----------------------------------------
  if (!user || user.role !== "STUDENT" || !user.studentProfile) {
    redirect("/setup");
  }

  const profile = user.studentProfile;
  const skills = profile.skills;

  // -----------------------------------------
  // 4. Calculate Skill DNA statistics
  // -----------------------------------------

  const averageSkill =
    skills.length > 0
      ? Math.round(
          skills.reduce(
            (sum, studentSkill) => sum + studentSkill.proficiency,
            0
          ) / skills.length
        )
      : 0;

  const strongSkills = [...skills]
    .filter((studentSkill) => studentSkill.proficiency >= 75)
    .sort((a, b) => b.proficiency - a.proficiency);

  const improvementSkills = [...skills]
    .filter((studentSkill) => studentSkill.proficiency < 60)
    .sort((a, b) => a.proficiency - b.proficiency);

  const sortedSkills = [...skills].sort(
    (a, b) => b.proficiency - a.proficiency
  );

  // -----------------------------------------
  // 5. Verification statistics
  // -----------------------------------------

  const verifiedSkills = skills.filter(
    (skill) => skill.verificationStrength !== "UNVERIFIED"
  );

  const verificationPercentage =
    skills.length > 0
      ? Math.round((verifiedSkills.length / skills.length) * 100)
      : 0;

  // -----------------------------------------
  // 6. Applications
  // -----------------------------------------

  const applications = profile.applications;

  const appliedCount = applications.length;

  // -----------------------------------------
  // 7. Total opportunities
  // -----------------------------------------

  const opportunityCount = await prisma.opportunity.count();

  // -----------------------------------------
  // 8. Greeting
  // -----------------------------------------

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] px-6 py-10 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/[0.08] blur-[150px]" />
        <div className="absolute bottom-[-250px] left-[-150px] h-[500px] w-[500px] rounded-full bg-blue-600/[0.05] blur-[140px]" />
        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-purple-600/[0.05] blur-[140px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium tracking-wide text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              STUDENT DASHBOARD
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {firstName}{" "}
              <span className="inline-block">👋</span>
            </h1>

            <p className="mt-2 text-gray-500">
              Here&apos;s where you stand today.
            </p>
          </div>

          <Link
            href="/student/opportunities"
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-purple-500/30 hover:bg-purple-500/[0.08] hover:text-white"
          >
            Explore Opportunities
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </section>

        {/* Readiness Stats */}
        <section className="grid gap-5 md:grid-cols-3">
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
            icon="↗"
          />

          <DashboardStatCard
            label="Skills to Improve"
            value={improvementSkills.length}
            description="Skills below 60%"
            icon="△"
          />
        </section>

        {/* Skill DNA */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-black/20">
          <div className="border-b border-white/[0.06] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-300">
                    ◈
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Your Skill DNA
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Your current capability profile
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-gray-400">
                {skills.length} {skills.length === 1 ? "skill" : "skills"}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {sortedSkills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-xl text-purple-300">
                  ◈
                </div>

                <p className="font-medium text-gray-300">
                  No skills added yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Your Skill DNA will appear here once skills are added.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedSkills.map((studentSkill) => {
                  const proficiency = studentSkill.proficiency;

                  return (
                    <div key={studentSkill.id} className="group">
                      <div className="mb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-200">
                            {studentSkill.skill.name}
                          </span>

                          {studentSkill.verificationStrength !==
                            "UNVERIFIED" && (
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                              Verified
                            </span>
                          )}
                        </div>

                        <span className="text-sm font-semibold text-gray-400">
                          {proficiency}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700"
                          style={{
                            width: `${proficiency}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Skills to Improve */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  ↗
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
            </div>

            <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-500">
              &lt; 60%
            </span>
          </div>

          {improvementSkills.length === 0 ? (
            <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6 text-center">
              <div className="text-2xl">✓</div>

              <p className="mt-2 font-medium text-emerald-300">
                Great work!
              </p>

              <p className="mt-1 text-sm text-gray-500">
                You currently have no skills below 60%.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {improvementSkills.map((studentSkill) => (
                <div
                  key={studentSkill.id}
                  className="group rounded-xl border border-white/[0.08] bg-black/20 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-200">
                      {studentSkill.skill.name}
                    </h3>

                    <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300">
                      {studentSkill.proficiency}%
                    </span>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                      style={{
                        width: `${studentSkill.proficiency}%`,
                      }}
                    />
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    Needs improvement
                  </p>

                  <button className="mt-4 text-sm font-medium text-purple-300 transition hover:text-purple-200">
                    View recommended action{" "}
                    <span className="ml-1 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Opportunity Discovery */}
        <section className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.10] via-purple-500/[0.04] to-blue-500/[0.04] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                OPPORTUNITY DISCOVERY
              </div>

              <h2 className="text-2xl font-bold tracking-tight">
                {opportunityCount}{" "}
                {opportunityCount === 1
                  ? "opportunity"
                  : "opportunities"}{" "}
                available
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                SkillSetu compares your Skill DNA against opportunity
                requirements to help you discover relevant opportunities.
              </p>
            </div>

            <Link
              href="/student/opportunities"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-purple-500/30"
            >
              Explore Opportunities
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>

        {/* Student Workspace */}
        <section className="pb-8">
          <div className="mb-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Workspace
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Your SkillSetu Workspace
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <WorkspaceCard
              href="/student/assessment"
              icon="✓"
              title="Assessments"
              description="View your assessment performance and evidence."
            />

            <WorkspaceCard
              href="/student/portfolio"
              icon="◇"
              title="Portfolio"
              description="Showcase projects and verified skill evidence."
            />

            <WorkspaceCard
              href="/student/roadmap"
              icon="↗"
              title="Career Roadmap"
              description="Work toward your target career direction."
            />
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
          ? "border-purple-500/20 bg-gradient-to-br from-purple-500/[0.10] to-purple-500/[0.03] shadow-lg shadow-purple-500/5"
          : "border-white/[0.08] bg-white/[0.025] hover:border-purple-500/15 hover:bg-white/[0.04]"
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-500/[0.05] blur-3xl transition-all group-hover:bg-purple-500/[0.1]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {label}
          </p>

          <p
            className={`mt-3 text-4xl font-bold tracking-tight ${
              highlight
                ? "bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent"
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
              ? "border-purple-400/10 bg-purple-500/10 text-purple-300"
              : "border-white/10 bg-white/[0.04] text-gray-400"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =============================================
   WORKSPACE CARD
============================================= */

function WorkspaceCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/25 hover:bg-white/[0.045]"
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-purple-500/[0.04] blur-2xl transition group-hover:bg-purple-500/[0.08]" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-purple-300">
            {icon}
          </div>

          <span className="text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-purple-400">
            →
          </span>
        </div>

        <h3 className="mt-5 font-semibold text-gray-200">
          {title}
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>
    </Link>
  );
}
