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
    <main className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ---------------------------------- */}
        {/* HEADER */}
        {/* ---------------------------------- */}

        <section>
          <p className="text-sm font-medium tracking-wide text-purple-400">
            STUDENT DASHBOARD
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Welcome back, {firstName} 👋
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Track your Skill DNA, discover relevant
            opportunities, and work on the skills that
            matter for your career goals.
          </p>
        </section>

        {/* ---------------------------------- */}
        {/* QUICK ACTIONS */}
        {/* ---------------------------------- */}

        <section className="grid gap-4 md:grid-cols-4">

          <Link
            href="/student/skill-dna"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/40 hover:bg-white/[0.06]"
          >
            <p className="text-2xl">🧬</p>

            <h2 className="mt-3 font-semibold">
              Skill DNA
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View your complete skill profile
            </p>
          </Link>

          <Link
            href="/student/opportunities"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/40 hover:bg-white/[0.06]"
          >
            <p className="text-2xl">🎯</p>

            <h2 className="mt-3 font-semibold">
              Opportunities
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Find opportunities matching your skills
            </p>
          </Link>

          <Link
            href="/student/gaps"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/40 hover:bg-white/[0.06]"
          >
            <p className="text-2xl">📈</p>

            <h2 className="mt-3 font-semibold">
              Skill Gaps
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Identify skills you should improve
            </p>
          </Link>

          <Link
            href="/student/roadmap"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/40 hover:bg-white/[0.06]"
          >
            <p className="text-2xl">🗺️</p>

            <h2 className="mt-3 font-semibold">
              Career Roadmap
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Follow your personalized roadmap
            </p>
          </Link>

        </section>

        {/* ---------------------------------- */}
        {/* OVERVIEW CARDS */}
        {/* ---------------------------------- */}

        <section className="grid gap-5 md:grid-cols-4">

          {/* Skill DNA Strength */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Skill DNA Strength
            </p>

            <p className="mt-3 text-4xl font-bold">
              {averageSkill}%
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Average proficiency across
              your recorded skills
            </p>
          </div>

          {/* Strong Skills */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Strong Skills
            </p>

            <p className="mt-3 text-4xl font-bold">
              {strongSkills.length}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Skills at or above 75%
            </p>
          </div>

          {/* Verification */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Skill Verification
            </p>

            <p className="mt-3 text-4xl font-bold">
              {verificationPercentage}%
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Skills with verification evidence
            </p>
          </div>

          {/* Applications */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-500">
              Applications
            </p>

            <p className="mt-3 text-4xl font-bold">
              {appliedCount}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Recent applications recorded
            </p>
          </div>

        </section>

        {/* ---------------------------------- */}
        {/* SKILL DNA */}
        {/* ---------------------------------- */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-purple-400">
                YOUR SKILL DNA
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Current Capability Profile
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your recorded skills and current
                proficiency levels.
              </p>
            </div>

            <Link
              href="/student/skill-dna"
              className="text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              View full Skill DNA →
            </Link>

          </div>

          {sortedSkills.length === 0 ? (

            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-gray-400">
                You have not added any skills yet.
              </p>

              <Link
                href="/student/skill-dna"
                className="mt-4 inline-block text-sm font-medium text-purple-400"
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

                        <span className="text-sm text-gray-400">
                          {studentSkill.proficiency}%
                        </span>

                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-500">
                          {studentSkill.verificationStrength}
                        </span>

                      </div>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">

                      <div
                        className="h-full rounded-full bg-purple-500 transition-all"
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-purple-400">
                  DEVELOPMENT
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Skills to Improve
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Skills currently below 60%.
                </p>
              </div>

              <Link
                href="/student/gaps"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                View all →
              </Link>

            </div>

            {improvementSkills.length === 0 ? (

              <div className="mt-6 rounded-xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm text-gray-400">
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
                      className="flex items-center justify-between rounded-xl border border-white/10 p-4"
                    >

                      <div>
                        <p className="font-medium">
                          {studentSkill.skill.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Development area
                        </p>
                      </div>

                      <span className="font-semibold text-gray-300">
                        {studentSkill.proficiency}%
                      </span>

                    </div>

                  ))}

              </div>

            )}

          </div>

          {/* Recent Applications */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-purple-400">
                  APPLICATIONS
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Recent Applications
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Track opportunities you have applied to.
                </p>
              </div>

              <Link
                href="/student/applications"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                View all →
              </Link>

            </div>

            {applications.length === 0 ? (

              <div className="mt-6 rounded-xl border border-dashed border-white/10 p-6 text-center">

                <p className="text-sm text-gray-400">
                  You have not applied to any
                  opportunities yet.
                </p>

                <Link
                  href="/student/opportunities"
                  className="mt-3 inline-block text-sm font-medium text-purple-400"
                >
                  Explore opportunities →
                </Link>

              </div>

            ) : (

              <div className="mt-6 space-y-3">

                {applications.map((application) => (

                  <div
                    key={application.id}
                    className="rounded-xl border border-white/10 p-4"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="font-medium">
                          {application.opportunity.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {application.opportunity.company}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase text-gray-400">
                        {application.status}
                      </span>

                    </div>

                    {application.matchScore !== null && (
                      <p className="mt-3 text-xs text-gray-500">
                        Match score:{" "}
                        <span className="font-medium text-purple-300">
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
        {/* DISCOVERY */}
        {/* ---------------------------------- */}

        <section className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-purple-400">
                OPPORTUNITY DISCOVERY
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {opportunityCount} opportunities available
              </h2>

              <p className="mt-2 max-w-xl text-sm text-gray-400">
                SkillSetu compares your Skill DNA against
                opportunity requirements to help you discover
                relevant opportunities.
              </p>

            </div>

            <Link
              href="/student/opportunities"
              className="shrink-0 rounded-xl bg-purple-600 px-6 py-3 text-center text-sm font-semibold transition hover:bg-purple-500"
            >
              Explore Opportunities
            </Link>

          </div>

        </section>

        {/* ---------------------------------- */}
        {/* OTHER STUDENT TOOLS */}
        {/* ---------------------------------- */}

        <section>

          <h2 className="mb-4 text-lg font-semibold">
            Your SkillSetu Workspace
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            <Link
              href="/student/assessment"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
            >
              <h3 className="font-semibold">
                Assessments
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View your assessment performance
                and evidence.
              </p>
            </Link>

            <Link
              href="/student/portfolio"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
            >
              <h3 className="font-semibold">
                Portfolio
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Showcase projects and verified
                skill evidence.
              </p>
            </Link>

            <Link
              href="/student/roadmap"
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
            >
              <h3 className="font-semibold">
                Career Roadmap
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Work toward your target career
                direction.
              </p>
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}