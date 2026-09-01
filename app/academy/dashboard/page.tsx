"use client";

import { useRouter } from "next/navigation";

const courses = [
  {
    title: "Full Stack Development",
    description:
      "Build modern web applications using React, Next.js and backend APIs.",
    skills: ["React", "Next.js", "Node.js"],
    students: 42,
  },
  {
    title: "Database Fundamentals",
    description:
      "Learn relational databases, SQL and practical database design.",
    skills: ["PostgreSQL", "SQL", "Prisma"],
    students: 28,
  },
  {
    title: "Backend Engineering",
    description:
      "Learn API design, authentication and scalable backend architecture.",
    skills: ["REST APIs", "Node.js", "Authentication"],
    students: 35,
  },
];

export default function AcademyDashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#2BA792]">
              SkillSetu Academy
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Learning Dashboard
            </h1>

            <p className="mt-2 text-[#9AA3C0]">
              Help students build the skills required by industry.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="rounded-xl border border-[#232B47] px-5 py-3 text-sm font-semibold text-[#C7CCE0] hover:bg-white/5"
          >
            Student View
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Active Courses"
            value="12"
            description="Currently available"
          />

          <StatCard
            label="Enrolled Students"
            value="247"
            description="Across all courses"
          />

          <StatCard
            label="Skills Covered"
            value="38"
            description="Industry-relevant skills"
          />
        </section>

        <section>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Featured Learning Paths
              </h2>

              <p className="mt-2 text-sm text-[#9AA3C0]">
                Courses aligned with skills students need for real
                opportunities.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.title}
                className="rounded-2xl border border-[#232B47] bg-[#171E33]/70 p-6 transition hover:border-[#5B6488]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4A93B]/10 text-[#F4A93B]">
                  ↗
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {course.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#9AA3C0]">
                  {course.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {course.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#232B47] px-3 py-1 text-xs text-[#C7CCE0]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#232B47] pt-5">
                  <span className="text-xs text-[#9AA3C0]">
                    {course.students} students enrolled
                  </span>

                  <button
                    type="button"
                    className="text-sm font-semibold text-[#F4A93B] hover:text-[#f6bd6a]"
                  >
                    View Course →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/70 p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#2BA792]">
                Industry Alignment
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Keep learning relevant to the market
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9AA3C0]">
                SkillSetu connects academic learning with the skills
                required by internships, jobs and industry projects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/student/opportunities")}
              className="shrink-0 rounded-xl bg-[#2BA792] px-5 py-3 text-sm font-semibold text-[#0F1526] hover:bg-[#57C7B5]"
            >
              Explore Opportunities
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/70 p-6">
      <p className="text-sm text-[#9AA3C0]">{label}</p>

      <p className="mt-3 text-3xl font-bold text-[#F5F1E8]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#6B7596]">
        {description}
      </p>
    </div>
  );
}