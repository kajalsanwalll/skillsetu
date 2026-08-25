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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}

        <div>
          <p className="text-sm text-gray-500">
            STUDENT DASHBOARD
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Here&apos;s where you stand today.
          </p>
        </div>

        {/* Readiness */}

        <section className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Career Readiness
            </p>

            <p className="mt-3 text-5xl font-bold">
              {averageSkill}%
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Based on your current Skill DNA
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Strong Skills
            </p>

            <p className="mt-3 text-5xl font-bold">
              {strongSkills.length}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Skills above 75%
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Skills to Improve
            </p>

            <p className="mt-3 text-5xl font-bold">
              {improvementSkills.length}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Skills below 60%
            </p>
          </div>

        </section>

        {/* Skill DNA */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Your Skill DNA
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your current capability profile
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">

            {skills
              .sort(
                (a, b) =>
                  b.proficiency - a.proficiency
              )
              .map((studentSkill) => (

                <div key={studentSkill.id}>

                  <div className="mb-2 flex justify-between">
                    <span className="font-medium">
                      {studentSkill.skill.name}
                    </span>

                    <span className="text-sm text-gray-500">
                      {studentSkill.proficiency}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{
                        width: `${studentSkill.proficiency}%`,
                      }}
                    />
                  </div>

                </div>

              ))}

          </div>

        </section>

        {/* Improvement */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            Skills to Improve
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            These are your biggest current gaps.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            {improvementSkills.map(
              (studentSkill) => (

                <div
                  key={studentSkill.id}
                  className="rounded-xl border p-5"
                >

                  <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                      {studentSkill.skill.name}
                    </h3>

                    <span className="text-sm font-medium">
                      {studentSkill.proficiency}%
                    </span>

                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Needs improvement
                  </p>

                  <button className="mt-4 text-sm font-medium underline">
                    View recommended action →
                  </button>

                </div>

              )
            )}

          </div>

        </section>

      </div>
    </main>
  );
}