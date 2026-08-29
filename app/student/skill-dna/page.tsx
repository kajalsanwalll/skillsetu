import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SkillDNAPage() {
  // -----------------------------------------
  // 1. Authenticate
  // -----------------------------------------

  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect("/sign-in");
  }

  // -----------------------------------------
  // 2. Fetch student + Skill DNA
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
            orderBy: {
              skill: {
                name: "asc",
              },
            },
          },

          evidence: {
            include: {
              skill: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },

          academicCredentials: {
            orderBy: {
              createdAt: "desc",
            },
          },

          assessments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  // -----------------------------------------
  // 3. Student validation
  // -----------------------------------------

  if (
    !user ||
    user.role !== "STUDENT" ||
    !user.studentProfile
  ) {
    redirect("/setup");
  }

  const profile = user.studentProfile;

  const skills = profile.skills;
  const evidence = profile.evidence;
  const credentials = profile.academicCredentials;
  const assessments = profile.assessments;

  // -----------------------------------------
  // 4. Evidence statistics
  // -----------------------------------------

  const highVerification = skills.filter(
    (skill) => skill.verificationStrength === "HIGH"
  ).length;

  const mediumVerification = skills.filter(
    (skill) => skill.verificationStrength === "MEDIUM"
  ).length;

  const lowVerification = skills.filter(
    (skill) => skill.verificationStrength === "LOW"
  ).length;

  const unverifiedSkills = skills.filter(
    (skill) =>
      skill.verificationStrength === "UNVERIFIED"
  ).length;

  const verifiedSkills =
    highVerification +
    mediumVerification +
    lowVerification;

  const verificationPercentage =
    skills.length > 0
      ? Math.round(
          (verifiedSkills / skills.length) * 100
        )
      : 0;

  // -----------------------------------------
  // 5. Categories
  // -----------------------------------------

  const categories = Array.from(
    new Set(
      skills
        .map((skill) => skill.skill.category)
        .filter(
          (category): category is string =>
            Boolean(category)
        )
    )
  );

  // -----------------------------------------
  // 6. Evidence-backed skills
  // -----------------------------------------

  const skillsWithEvidence = skills.filter((skill) =>
    evidence.some(
      (item) => item.skillId === skill.skillId
    )
  ).length;

  const skillsWithVerifiedEvidence =
    skills.filter((skill) =>
      evidence.some(
        (item) =>
          item.skillId === skill.skillId &&
          item.verified
      )
    ).length;

  // -----------------------------------------
  // 7. Evidence type statistics
  // -----------------------------------------

  const assessmentEvidence = evidence.filter(
    (item) => item.type === "ASSESSMENT"
  ).length;

  const projectEvidence = evidence.filter(
    (item) => item.type === "PROJECT"
  ).length;

  const internshipEvidence = evidence.filter(
    (item) => item.type === "INTERNSHIP"
  ).length;

  const certificationEvidence = evidence.filter(
    (item) => item.type === "CERTIFICATION"
  ).length;

  const academicEvidence = evidence.filter(
    (item) =>
      item.type === "ACADEMIC_CREDENTIAL" ||
      item.type === "NPTEL"
  ).length;

  const selfReportedEvidence = evidence.filter(
    (item) => item.type === "SELF_REPORTED"
  ).length;

  // -----------------------------------------
  // 8. Page palette
  // -----------------------------------------

  const TEAL = "#2BA792";
  const MARIGOLD = "#F4A93B";
  const ROSE = "#E8598B";
  const MUTED = "#9AA3C0";

  return (
    <main className="min-h-screen bg-[#0F1526] px-6 py-10 text-[#F5F1E8]">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <section>
          <Link
            href="/student/dashboard"
            className="text-sm text-[#9AA3C0] transition hover:text-[#C7CCE0]"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-6 text-sm font-medium tracking-wide text-[#F4A93B]">
            SKILL INTELLIGENCE
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Your Skill DNA
          </h1>

          <p className="mt-3 max-w-2xl text-[#9AA3C0]">
            A structured view of your skills, the evidence
            behind them, and how strongly that evidence has
            been verified.
          </p>
        </section>

        {/* -------------------------------- */}
        {/* PRIMARY OVERVIEW */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <div className="grid gap-6 md:grid-cols-4">

            <OverviewCard
              label="Skills"
              value={skills.length}
              description="Skills currently listed"
              accent={MARIGOLD}
            />

            <OverviewCard
              label="Evidence"
              value={evidence.length}
              description="Supporting evidence items"
              accent={TEAL}
            />

            <OverviewCard
              label="Verified Skills"
              value={verifiedSkills}
              description="Skills with verification"
              accent={TEAL}
            />

            <OverviewCard
              label="Verification"
              value={`${verificationPercentage}%`}
              description="Of listed skills verified"
              accent={MARIGOLD}
            />

          </div>

          {/* Important explanation */}

          <div className="mt-8 rounded-xl border border-[#F4A93B]/20 bg-[#F4A93B]/5 p-5">
            <p className="text-sm font-medium text-[#F4A93B]">
              HOW SKILL DNA WORKS
            </p>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-[#C7CCE0]">
              SkillSetu does not treat a percentage as a universal
              measure of how skilled someone is. A skill level is
              contextual and depends on the role, task, and evidence
              available. Instead, Skill DNA combines your declared
              skills with supporting evidence and its verification
              strength.
            </p>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* PROFILE SUMMARY */}
        {/* -------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* Career Interest */}

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-sm font-medium text-[#F4A93B]">
              CAREER INTEREST
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {profile.careerInterest ||
                "Not specified"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#9AA3C0]">
              Your career direction helps SkillSetu
              personalize opportunity recommendations
              and identify relevant skill gaps.
            </p>
          </div>

          {/* Categories */}

          <div className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">
            <p className="text-sm font-medium text-[#F4A93B]">
              SKILL CATEGORIES
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <span className="text-sm text-[#9AA3C0]">
                  No categories yet
                </span>
              ) : (
                categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-[#232B47] px-3 py-1 text-xs text-[#C7CCE0]"
                  >
                    {category}
                  </span>
                ))
              )}
            </div>

            <p className="mt-4 text-xs text-[#9AA3C0]">
              {credentials.length} credentials ·{" "}
              {assessments.length} assessments
            </p>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* EVIDENCE OVERVIEW */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <p className="text-sm font-medium text-[#F4A93B]">
            EVIDENCE PROFILE
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            How well supported are your skills?
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-[#9AA3C0]">
            Evidence strengthens confidence in a skill.
            Different evidence sources carry different
            levels of credibility and verification.
          </p>

          {/* Verification distribution */}

          <div className="mt-8">
            <SegmentedBar
              label="Verification strength"
              segments={[
                {
                  label: "High",
                  count: highVerification,
                  color: TEAL,
                },
                {
                  label: "Medium",
                  count: mediumVerification,
                  color: MARIGOLD,
                },
                {
                  label: "Low",
                  count: lowVerification,
                  color: ROSE,
                },
                {
                  label: "Unverified",
                  count: unverifiedSkills,
                  color: MUTED,
                },
              ]}
            />
          </div>

          {/* Evidence coverage */}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            <MiniEvidenceCard
              label="Skills with evidence"
              value={skillsWithEvidence}
              total={skills.length}
            />

            <MiniEvidenceCard
              label="Verified evidence"
              value={skillsWithVerifiedEvidence}
              total={skills.length}
            />

            <MiniEvidenceCard
              label="Total evidence items"
              value={evidence.length}
            />

          </div>
        </section>

        {/* -------------------------------- */}
        {/* EVIDENCE SOURCES */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <p className="text-sm font-medium text-[#F4A93B]">
            EVIDENCE SOURCES
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            What supports your profile?
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <EvidenceTypeCard
              label="Assessments"
              count={assessmentEvidence}
              description="Structured assessments or tests"
              accent={TEAL}
            />

            <EvidenceTypeCard
              label="Projects"
              count={projectEvidence}
              description="Demonstrable or evaluated work"
              accent={MARIGOLD}
            />

            <EvidenceTypeCard
              label="Internships"
              count={internshipEvidence}
              description="Professional experience"
              accent={TEAL}
            />

            <EvidenceTypeCard
              label="Certifications"
              count={certificationEvidence}
              description="Industry or professional credentials"
              accent={MARIGOLD}
            />

            <EvidenceTypeCard
              label="Academic"
              count={academicEvidence}
              description="Academic credentials and NPTEL"
              accent={TEAL}
            />

            <EvidenceTypeCard
              label="Self Reported"
              count={selfReportedEvidence}
              description="Information declared by you"
              accent={MUTED}
            />

          </div>
        </section>

        {/* -------------------------------- */}
        {/* SKILL LIST */}
        {/* -------------------------------- */}

        <section className="rounded-2xl border border-[#232B47] bg-[#171E33]/60 p-6">

          <p className="text-sm font-medium text-[#F4A93B]">
            CAPABILITY PROFILE
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Your Skills
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-[#9AA3C0]">
            Your reported skills are shown together with
            the evidence and verification supporting them.
            These are not universal skill percentages.
          </p>

          {skills.length === 0 ? (

            <div className="mt-8 rounded-xl border border-dashed border-[#232B47] p-10 text-center">
              <p className="text-[#9AA3C0]">
                Your Skill DNA is empty.
              </p>

              <p className="mt-2 text-sm text-[#5B6488]">
                Skills will appear here once they are
                added to your profile.
              </p>
            </div>

          ) : (

            <div className="mt-8 space-y-4">

              {skills.map((studentSkill) => {

                const skillEvidence =
                  evidence.filter(
                    (item) =>
                      item.skillId ===
                      studentSkill.skillId
                  );

                const verifiedEvidence =
                  skillEvidence.filter(
                    (item) => item.verified
                  );

                const verificationColor =
                  getVerificationColor(
                    studentSkill.verificationStrength
                  );

                const verificationLabel =
                  getVerificationLabel(
                    studentSkill.verificationStrength
                  );

                return (
                  <div
                    key={studentSkill.id}
                    className="rounded-xl border border-[#232B47] p-5"
                  >

                    {/* Skill header */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <h3 className="text-lg font-semibold">
                          {studentSkill.skill.name}
                        </h3>

                        {studentSkill.skill.category && (
                          <p className="mt-1 text-xs text-[#9AA3C0]">
                            {studentSkill.skill.category}
                          </p>
                        )}
                      </div>

                      <span
                        className="w-fit rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide"
                        style={{
                          borderColor: `${verificationColor}40`,
                          color: verificationColor,
                          backgroundColor: `${verificationColor}10`,
                        }}
                      >
                        {verificationLabel}
                      </span>

                    </div>

                    {/* Self reported value */}

                    <div className="mt-5 rounded-lg border border-[#232B47] bg-[#0F1526]/50 p-4">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">
                            Self-reported
                          </p>

                          <p className="mt-1 text-sm text-[#C7CCE0]">
                            This value represents what you
                            reported about yourself, not an
                            objectively measured skill level.
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#5B6488]">
                            {Math.round(
                              studentSkill.proficiency
                            )}
                          </span>

                          <span className="ml-1 text-xs text-[#9AA3C0]">
                            / 100
                          </span>
                        </div>

                      </div>
                    </div>

                    {/* Evidence */}

                    <div className="mt-4">

                      <div className="flex flex-wrap items-center justify-between gap-2">

                        <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">
                          Supporting Evidence
                        </p>

                        <p className="text-xs text-[#C7CCE0]">
                          {skillEvidence.length} item
                          {skillEvidence.length === 1
                            ? ""
                            : "s"}
                          {" · "}
                          {verifiedEvidence.length} verified
                        </p>

                      </div>

                      {skillEvidence.length === 0 ? (

                        <div className="mt-3 rounded-lg border border-dashed border-[#232B47] p-4">
                          <p className="text-sm text-[#9AA3C0]">
                            No supporting evidence yet.
                          </p>

                          <p className="mt-1 text-xs text-[#5B6488]">
                            Add projects, assessments,
                            certifications, internships,
                            or other credible evidence to
                            strengthen this skill.
                          </p>
                        </div>

                      ) : (

                        <div className="mt-3 space-y-2">

                          {skillEvidence
                            .slice(0, 4)
                            .map((item) => (

                              <div
                                key={item.id}
                                className="flex flex-col gap-2 rounded-lg border border-[#232B47] bg-[#0F1526]/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                              >

                                <div>
                                  <p className="text-sm text-[#C7CCE0]">
                                    {item.title}
                                  </p>

                                  <p className="mt-1 text-[11px] uppercase tracking-wide text-[#9AA3C0]">
                                    {item.type.replaceAll(
                                      "_",
                                      " "
                                    )}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">

                                  {item.score !== null && (
                                    <span className="text-xs text-[#9AA3C0]">
                                      Score:{" "}
                                      <span className="text-[#C7CCE0]">
                                        {item.score}
                                      </span>
                                    </span>
                                  )}

                                  <span
                                    className={
                                      item.verified
                                        ? "rounded-full border border-[#2BA792]/30 bg-[#2BA792]/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#2BA792]"
                                        : "rounded-full border border-[#3A4266] bg-[#0F1526]/60 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#9AA3C0]"
                                    }
                                  >
                                    {item.verified
                                      ? "Verified"
                                      : "Unverified"}
                                  </span>

                                </div>

                              </div>

                            ))}

                          {skillEvidence.length > 4 && (
                            <p className="pt-1 text-xs text-[#7A82A6]">
                              +
                              {skillEvidence.length - 4}{" "}
                              more evidence items
                            </p>
                          )}

                        </div>

                      )}

                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </section>

        {/* -------------------------------- */}
        {/* NEXT STEPS */}
        {/* -------------------------------- */}

        <section className="grid gap-4 md:grid-cols-3">

          <Link
            href="/student/opportunities"
            className="rounded-xl border border-[#232B47] bg-[#171E33]/60 p-5 transition hover:border-[#F4A93B]/40"
          >
            <p className="text-sm font-medium text-[#F4A93B]">
              OPPORTUNITIES
            </p>

            <h3 className="mt-2 font-semibold">
              See where your skills fit →
            </h3>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Explore opportunities using your skills,
              evidence, interests, and eligibility.
            </p>
          </Link>

          <Link
            href="/student/gaps"
            className="rounded-xl border border-[#232B47] bg-[#171E33]/60 p-5 transition hover:border-[#F4A93B]/40"
          >
            <p className="text-sm font-medium text-[#F4A93B]">
              SKILL GAPS
            </p>

            <h3 className="mt-2 font-semibold">
              Find areas to improve →
            </h3>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Identify missing or weakly evidenced skills
              relative to specific opportunities.
            </p>
          </Link>

          <Link
            href="/student/portfolio"
            className="rounded-xl border border-[#232B47] bg-[#171E33]/60 p-5 transition hover:border-[#F4A93B]/40"
          >
            <p className="text-sm font-medium text-[#F4A93B]">
              PORTFOLIO
            </p>

            <h3 className="mt-2 font-semibold">
              Build your evidence →
            </h3>

            <p className="mt-1 text-sm text-[#9AA3C0]">
              Add projects, certifications, assessments,
              and professional experience.
            </p>
          </Link>

        </section>
      </div>
    </main>
  );
}

/* --------------------------------------------- */
/* OVERVIEW CARD */
/* --------------------------------------------- */

function OverviewCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string | number;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-[#232B47] p-5">
      <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">
        {label}
      </p>

      <p
        className="mt-2 text-3xl font-bold"
        style={{ color: accent }}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-[#9AA3C0]">
        {description}
      </p>
    </div>
  );
}

/* --------------------------------------------- */
/* MINI EVIDENCE CARD */
/* --------------------------------------------- */

function MiniEvidenceCard({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total?: number;
}) {
  return (
    <div className="rounded-xl border border-[#232B47] p-4">
      <p className="text-xs text-[#9AA3C0]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#F5F1E8]">
        {value}
        {total !== undefined && (
          <span className="ml-1 text-sm font-normal text-[#5B6488]">
            / {total}
          </span>
        )}
      </p>
    </div>
  );
}

/* --------------------------------------------- */
/* EVIDENCE TYPE CARD */
/* --------------------------------------------- */

function EvidenceTypeCard({
  label,
  count,
  description,
  accent,
}: {
  label: string;
  count: number;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-[#232B47] p-4">

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#C7CCE0]">
          {label}
        </p>

        <span
          className="text-xl font-bold"
          style={{ color: accent }}
        >
          {count}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-[#9AA3C0]">
        {description}
      </p>
    </div>
  );
}

/* --------------------------------------------- */
/* SEGMENTED BAR */
/* --------------------------------------------- */

function SegmentedBar({
  label,
  segments,
}: {
  label: string;
  segments: {
    label: string;
    count: number;
    color: string;
  }[];
}) {
  const total = segments.reduce(
    (sum, segment) => sum + segment.count,
    0
  );

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[#9AA3C0]">
        {label}
      </p>

      <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-white/5">
        {total === 0 ? (
          <div className="h-full w-full bg-white/5" />
        ) : (
          segments.map((segment) => (
            <div
              key={segment.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(segment.count / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <span
            key={segment.label}
            className="flex items-center gap-1.5 text-xs text-[#9AA3C0]"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: segment.color,
              }}
            />

            {segment.label}:

            <span className="text-[#C7CCE0]">
              {segment.count}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------- */
/* VERIFICATION HELPERS */
/* --------------------------------------------- */

function getVerificationColor(
  strength: string
) {
  switch (strength) {
    case "HIGH":
      return "#2BA792";

    case "MEDIUM":
      return "#F4A93B";

    case "LOW":
      return "#E8598B";

    default:
      return "#9AA3C0";
  }
}

function getVerificationLabel(
  strength: string
) {
  switch (strength) {
    case "HIGH":
      return "High confidence";

    case "MEDIUM":
      return "Moderate confidence";

    case "LOW":
      return "Low confidence";

    default:
      return "Not yet verified";
  }
}