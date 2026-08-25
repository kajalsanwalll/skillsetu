import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  calculateSkillGaps,
  calculateReadiness,
} from "@/lib/gap-engine";

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

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

  if (!user?.studentProfile) {
    redirect("/setup");
  }

  const opportunity =
    await prisma.opportunity.findUnique({
      where: {
        id,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

  if (!opportunity) {
    redirect("/student/dashboard");
  }

  const studentSkills =
    user.studentProfile.skills.map(
      (studentSkill) => ({
        skillId: studentSkill.skill.id,
        skillName: studentSkill.skill.name,
        proficiency: studentSkill.proficiency,
      })
    );

  const targetSkills =
    opportunity.skills.map(
      (opportunitySkill) => ({
        skillId: opportunitySkill.skill.id,
        skillName: opportunitySkill.skill.name,
        minimumProficiency:
          opportunitySkill.minimumProficiency,
        weight: opportunitySkill.weight,
        required: opportunitySkill.required,
      })
    );

  const gaps = calculateSkillGaps(
    studentSkills,
    targetSkills
  );

  const readiness =
    calculateReadiness(gaps);

  const strong = gaps.filter(
    (gap) => gap.status === "STRONG"
  );

  const moderate = gaps.filter(
    (gap) => gap.status === "MODERATE"
  );

  const critical = gaps.filter(
    (gap) => gap.status === "CRITICAL"
  );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Job Header */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <p className="text-sm font-medium text-blue-600">
            {opportunity.type}
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            {opportunity.title}
          </h1>

          <p className="mt-2 text-lg text-gray-600">
            {opportunity.company}
          </p>

          <p className="mt-4 text-gray-500">
            {opportunity.description}
          </p>

          {opportunity.location && (
            <p className="mt-4 text-sm text-gray-500">
              📍 {opportunity.location}
            </p>
          )}

        </section>

        {/* Readiness */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <p className="text-sm text-gray-500">
            YOUR READINESS
          </p>

          <div className="mt-3 flex items-end gap-3">
            <span className="text-6xl font-bold">
              {readiness}%
            </span>

            <span className="mb-2 text-gray-500">
              match readiness
            </span>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-black"
              style={{
                width: `${readiness}%`,
              }}
            />
          </div>

          <p className="mt-4 text-gray-600">
            Your score is calculated from your current
            Skill DNA against the requirements of this
            opportunity.
          </p>

        </section>

        {/* Strong */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold">
            ✓ Strong Skills
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            You're currently meeting the expected level.
          </p>

          <div className="mt-6 space-y-4">

            {strong.map((gap) => (
              <div
                key={gap.skillId}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div>
                  <p className="font-semibold">
                    {gap.skillName}
                  </p>

                  <p className="text-sm text-gray-500">
                    Required: {gap.requiredProficiency}%
                  </p>
                </div>

                <p className="font-bold">
                  {gap.currentProficiency}%
                </p>
              </div>
            ))}

          </div>

        </section>

        {/* Moderate */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold">
            ⚠ Moderate Gaps
          </h2>

          <div className="mt-6 space-y-4">

            {moderate.map((gap) => (
              <div
                key={gap.skillId}
                className="rounded-xl border p-5"
              >

                <div className="flex justify-between">

                  <div>
                    <p className="font-semibold">
                      {gap.skillName}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {gap.currentProficiency}% current
                      {" → "}
                      {gap.requiredProficiency}% required
                    </p>
                  </div>

                  <p className="font-bold">
                    -{gap.gap}%
                  </p>

                </div>

                <button className="mt-4 text-sm font-medium underline">
                  View learning action →
                </button>

              </div>
            ))}

          </div>

        </section>

        {/* Critical */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold">
            🔴 Critical Gaps
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            These skills are currently the biggest barriers
            to readiness.
          </p>

          <div className="mt-6 space-y-4">

            {critical.map((gap) => (
              <div
                key={gap.skillId}
                className="rounded-xl border p-5"
              >

                <div className="flex justify-between">

                  <div>
                    <p className="font-semibold">
                      {gap.skillName}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {gap.currentProficiency}% current
                      {" → "}
                      {gap.requiredProficiency}% required
                    </p>
                  </div>

                  <p className="font-bold">
                    -{gap.gap}%
                  </p>

                </div>

                <button className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white">
                  Build this skill →
                </button>

              </div>
            ))}

          </div>

        </section>

      </div>
    </main>
  );
}