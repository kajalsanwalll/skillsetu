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
            (sum, studentSkill) =>
              sum + studentSkill.proficiency,
            0
          ) / skills.length
        )
      : 0;

  const strongSkills = [...skills]
    .filter(
      (studentSkill) =>
        studentSkill.proficiency >= 75
    )
    .sort(
      (a, b) =>
        b.proficiency - a.proficiency
    );

  const improvementSkills = [...skills]
    .filter(
      (studentSkill) =>
        studentSkill.proficiency < 60
    )
    .sort(
      (a, b) =>
        a.proficiency - b.proficiency
    );

  const sortedSkills = [...skills].sort(
    (a, b) =>
      b.proficiency - a.proficiency
  );

  // -----------------------------------------
  // 5. Verification statistics
  // -----------------------------------------

  const verifiedSkills = skills.filter(
    (skill) =>
      skill.verificationStrength !==
      "UNVERIFIED"
  );

  const verificationPercentage =
    skills.length > 0
      ? Math.round(
          (verifiedSkills.length /
            skills.length) *
            100
        )
      : 0;

  // -----------------------------------------
  // 6. Applications
  // -----------------------------------------

  const applications =
    profile.applications;

  const appliedCount =
    applications.length;

  // -----------------------------------------
  // 7. Total opportunities
  // -----------------------------------------

  const opportunityCount =
    await prisma.opportunity.count();

  // -----------------------------------------
  // 8. Greeting
  // -----------------------------------------

  const firstName =
    user.name?.split(" ")[0] ||
    "there";

  return (
    <main className="min-h-screen bg-[#0F1526] text-[#F5F1E8] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* ---------------------------------- */}
        {/* HEADER */}
        {/* ---------------------------------- */}

        <section>
          <p className="text-sm font-medium tracking-wide text-[#F4A93B]">
            STUDENT DASHBOARD
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Welcome back, {firstName} 👋
          </h1>

          <p className="mt-2 max-w-2xl text-[#9AA3C0]">
            Here&apos;s where your Skill DNA stands and what to work
            on next.
          </p>
        </section>

        {/* ---------------------------------- */}
        {/* NAV — light-touch, not competing with content */}
        {/* ---------------------------------- */}

        <nav className="flex flex-wrap gap-2">
          {[
            { href: "/student/skill-dna", icon: "🧬", label: "Skill DNA" },
            { href: "/student/opportunities", icon: "🎯", label: "Opportunities" },
            { href: "/student/gaps", icon: "📈", label: "Skill Gaps" },
            { href: "/student/roadmap", icon: "🗺️", label: "Roadmap" },
            { href: "/student/assessment", icon: "📝", label: "Assessments" },
            { href: "/student/portfolio", icon: "🗂️", label: "Portfolio" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-full border border-[#232B47] bg-[#171E33]/60 px-4 py-2 text-sm text-[#C7CCE0] transition hover:border-[#F4A93B]/40 hover:text-[#F5F1E8]"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ---------------------------------- */}
        {/* PRIMARY STAT — one anchor number, not four competing cards */}
        {/* ---------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-[#9AA3C0]">
                Skill DNA Strength
              </p>
              <p className="mt-2 text-5xl font-bold text-[#F4A93B]">
                {averageSkill}%
              </p>
              <p className="mt-2 text-xs text-[#9AA3C0]">
                Average proficiency across your recorded skills
              </p>
            </div>

            <div className="flex gap-6 border-t border-[#232B47] pt-5 md:border-t-0 md:border-l md:pl-8 md:pt-0">
              <Stat label="Strong skills" value={strongSkills.length} />
              <Stat label="Verified" value={`${verificationPercentage}%`} color="#2BA792" />
              <Stat label="Applications" value={appliedCount} color="#E8598B" />
            </div>

          </div>
        </section>

        {/* ---------------------------------- */}
        {/* SKILL DNA */}
        {/* ---------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Capability Profile
              </h2>

              <p className="mt-1 text-sm text-[#9AA3C0]">
                Your recorded skills and current proficiency levels.
              </p>
            </div>

            <Link
              href="/student/skill-dna"
              className="text-sm font-medium text-[#F4A93B] hover:text-[#f6bd6a]"
            >
              View full Skill DNA →
            </Link>

          </div>

          {sortedSkills.length === 0 ? (

            <div className="mt-6 rounded-xl border border-dashed border-[#232B47] p-8 text-center">
              <p className="text-[#9AA3C0]">
                You have not added any skills yet.
              </p>

              <Link
                href="/student/skill-dna"
                className="mt-4 inline-block text-sm font-medium text-[#F4A93B]"
              >
                Start building your Skill DNA →
              </Link>
            </div>

          ) : (

            <div className="mt-7 space-y-5">

              {sortedSkills
                .slice(0, 6)
                .map((studentSkill) => (

                  <div key={studentSkill.id}>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="font-medium">
                        {studentSkill.skill.name}
                      </span>

                      <div className="flex items-center gap-3">

                        <span className="text-sm text-[#9AA3C0]">
                          {studentSkill.proficiency}%
                        </span>

                        <span className="rounded-full border border-[#232B47] px-2 py-1 text-[10px] uppercase tracking-wide text-[#9AA3C0]">
                          {studentSkill.verificationStrength}
                        </span>

                      </div>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">

                      <div
                        className="h-full rounded-full bg-[#F4A93B] transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              studentSkill.proficiency,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* ---------------------------------- */}
        {/* TWO COLUMN SECTION */}
        {/* ---------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* Skills to Improve */}

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-lg font-bold">
                  Skills to Improve
                </h2>

                <p className="mt-1 text-sm text-[#9AA3C0]">
                  Below 60% proficiency.
                </p>
              </div>

              <Link
                href="/student/gaps"
                className="text-sm text-[#E8598B] hover:text-[#f083a8]"
              >
                View all →
              </Link>

            </div>

            {improvementSkills.length === 0 ? (

              <div className="mt-6 rounded-xl border border-dashed border-[#232B47] p-6 text-center">
                <p className="text-sm text-[#9AA3C0]">
                  No major improvement areas detected.
                </p>
              </div>

            ) : (

              <div className="mt-6 space-y-3">

                {improvementSkills
                  .slice(0, 4)
                  .map((studentSkill) => (

                    <div
                      key={studentSkill.id}
                      className="flex items-center justify-between rounded-xl border border-[#232B47] p-4"
                    >

                      <div>
                        <p className="font-medium">
                          {studentSkill.skill.name}
                        </p>

                        <p className="mt-1 text-xs text-[#9AA3C0]">
                          Development area
                        </p>
                      </div>

                      <span className="font-semibold text-[#C7CCE0]">
                        {studentSkill.proficiency}%
                      </span>

                    </div>

                  ))}

              </div>

            )}

          </div>

          {/* Recent Applications */}

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-lg font-bold">
                  Recent Applications
                </h2>

                <p className="mt-1 text-sm text-[#9AA3C0]">
                  Opportunities you have applied to.
                </p>
              </div>

              <Link
                href="/student/applications"
                className="text-sm text-[#F4A93B] hover:text-[#f6bd6a]"
              >
                View all →
              </Link>

            </div>

            {applications.length === 0 ? (

              <div className="mt-6 rounded-xl border border-dashed border-[#232B47] p-6 text-center">

                <p className="text-sm text-[#9AA3C0]">
                  You have not applied to any opportunities yet.
                </p>

                <Link
                  href="/student/opportunities"
                  className="mt-3 inline-block text-sm font-medium text-[#F4A93B]"
                >
                  Explore opportunities →
                </Link>

              </div>

            ) : (

              <div className="mt-6 space-y-3">

                {applications.map((application) => (

                  <div
                    key={application.id}
                    className="rounded-xl border border-[#232B47] p-4"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="font-medium">
                          {application.opportunity.title}
                        </p>

                        <p className="mt-1 text-xs text-[#9AA3C0]">
                          {application.opportunity.company}
                        </p>
                      </div>

                      <span className="rounded-full border border-[#232B47] px-2 py-1 text-[10px] uppercase text-[#9AA3C0]">
                        {application.status}
                      </span>

                    </div>

                    {application.matchScore !== null && (
                      <p className="mt-3 text-xs text-[#9AA3C0]">
                        Match score:{" "}
                        <span className="font-medium text-[#F4A93B]">
                          {Math.round(
                            application.matchScore
                          )}
                          %
                        </span>
                      </p>
                    )}

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>

        {/* ---------------------------------- */}
        {/* DISCOVERY — the one bold accent moment */}
        {/* ---------------------------------- */}

        <section className="rounded-2xl border border-[#F4A93B]/20 bg-[#F4A93B]/[0.06] p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold">
                {opportunityCount} opportunities available
              </h2>

              <p className="mt-2 max-w-xl text-sm text-[#C7CCE0]">
                SkillSetu compares your Skill DNA against opportunity
                requirements to surface the ones worth your time.
              </p>
            </div>

            <Link
              href="/student/opportunities"
              className="shrink-0 rounded-xl bg-[#F4A93B] px-6 py-3 text-center text-sm font-semibold text-[#0F1526] transition hover:bg-[#f6bd6a]"
            >
              Explore Opportunities
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  color = "#F5F1E8",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-[#9AA3C0]">{label}</p>
    </div>
  );
}