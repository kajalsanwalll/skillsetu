"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  FolderGit2,
  GraduationCap,
  Link2,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Skill = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  proficiency: number;
  competencyLevel: string | null;
  verificationStrength: string;
};

type Evidence = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  verified: boolean;
  verificationStrength: string;
  skill: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
};

type Portfolio = {
  user: {
    name: string;
    email: string;
  };

  profile: {
    careerInterest: string | null;
    bio: string | null;

    resume: {
      url: string;
      publicId: string | null;
      fileName: string | null;
      uploadedAt: string | null;
    } | null;
  };

  skills: Skill[];

  evidence: Evidence[];

  academicCredentials: any[];

  assessments: any[];
};

const evidenceLabels: Record<
  string,
  string
> = {
  PROJECT: "Project",
  CERTIFICATION: "Certification",
  INTERNSHIP: "Internship",
  NPTEL: "NPTEL",
  ASSESSMENT: "Assessment",
  SELF_REPORTED: "Other",
};

function competency(level: string | null) {
  if (!level) return "Developing";

  return (
    level.charAt(0) +
    level.slice(1).toLowerCase()
  );
}

function evidenceIcon(type: string) {
  switch (type) {
    case "PROJECT":
      return FolderGit2;

    case "CERTIFICATION":
      return Award;

    case "INTERNSHIP":
      return BriefcaseBusiness;

    case "ASSESSMENT":
      return ClipboardCheck;

    case "NPTEL":
      return GraduationCap;

    default:
      return FileText;
  }
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] =
    useState<Portfolio | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [skillModal, setSkillModal] =
    useState(false);

  const [evidenceModal, setEvidenceModal] =
    useState(false);

  const [resumeUploading, setResumeUploading] =
    useState(false);

  const [skillLoading, setSkillLoading] =
    useState(false);

  const [evidenceLoading, setEvidenceLoading] =
    useState(false);

  const resumeInput =
    useRef<HTMLInputElement>(null);

  async function loadPortfolio() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/student/portfolio",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to load portfolio."
        );
      }

      setPortfolio(data.portfolio);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load portfolio."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function uploadResume(
    file: File
  ) {
    if (
      file.type !==
      "application/pdf"
    ) {
      alert("Please upload a PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "Resume must be smaller than 10 MB."
      );
      return;
    }

    try {
      setResumeUploading(true);

      const formData =
        new FormData();

      formData.append(
        "action",
        "resume"
      );

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/student/portfolio",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Upload failed."
        );
      }

      await loadPortfolio();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Upload failed."
      );
    } finally {
      setResumeUploading(false);
    }
  }

  async function deleteResume() {
    if (
      !confirm(
        "Delete your current resume?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          "/api/student/portfolio",
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Delete failed."
        );
      }

      await loadPortfolio();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    }
  }

  async function addSkill(
    skillId: string,
    proficiency: number,
    level: string
  ) {
    try {
      setSkillLoading(true);

      const response =
        await fetch(
          "/api/student/portfolio",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action: "skill",
              skillId,
              proficiency,
              competencyLevel:
                level,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to add skill."
        );
      }

      setSkillModal(false);

      await loadPortfolio();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to add skill."
      );
    } finally {
      setSkillLoading(false);
    }
  }

  async function addEvidence(
    form: FormData
  ) {
    try {
      setEvidenceLoading(true);

      form.append(
        "action",
        "evidence"
      );

      const response =
        await fetch(
          "/api/student/portfolio",
          {
            method: "POST",
            body: form,
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to add evidence."
        );
      }

      setEvidenceModal(false);

      await loadPortfolio();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to add evidence."
      );
    } finally {
      setEvidenceLoading(false);
    }
  }

  function printPortfolio() {
    window.print();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080d1d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin mx-auto mb-4" />

          <p className="text-slate-400">
            Loading portfolio...
          </p>
        </div>
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className="min-h-screen bg-[#080d1d] text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
          <h2 className="text-xl font-semibold mb-3">
            Unable to load portfolio
          </h2>

          <p className="text-slate-400 mb-6">
            {error}
          </p>

          <button
            onClick={loadPortfolio}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const { user, profile } =
    portfolio;

  return (
    <main className="min-h-screen bg-[#080d1d] text-white">
      <div className="max-w-[1450px] mx-auto px-6 lg:px-12 py-7">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() =>
              window.history.back()
            }
            className="flex items-center gap-3 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />

            <span>
              Back to Dashboard
            </span>
          </button>

          <button
            onClick={printPortfolio}
            className="print:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-[#0d1428] hover:bg-[#121b34] transition"
          >
            <Download size={17} />

            Print / Download
          </button>
        </div>

        {/* ================================================= */}
        {/* PROFILE */}
        {/* ================================================= */}

        <section className="grid lg:grid-cols-[1fr_430px] gap-10 mb-10">

          <div className="flex gap-8 items-start">

            <div className="hidden sm:flex w-40 h-40 rounded-[24px] bg-gradient-to-br from-[#27396d] to-[#111a35] border border-blue-300/10 items-center justify-center shadow-2xl shrink-0">
              <span className="text-6xl font-semibold">
                {user.name
                  ?.charAt(0)
                  .toUpperCase()}
              </span>
            </div>

            <div className="pt-1">

              <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight">
                {user.name}
              </h1>

              <div className="flex items-center gap-2 mt-3 text-blue-400 text-xl">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />

                {profile.careerInterest ||
                  "Student"}
              </div>

              <p className="text-slate-400 max-w-2xl mt-5 leading-7">
                {profile.bio ||
                  "Building skills, learning through projects and preparing for real-world opportunities."}
              </p>

              <div className="flex flex-wrap gap-5 mt-6 text-slate-400">

                <span className="flex items-center gap-2">
                  <UserRound size={17} />
                  {user.email}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={17} />
                  India
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays size={17} />
                  Member
                </span>

              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* RESUME */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-slate-700/70 bg-[#121a31] p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-semibold">
                Resume
              </h2>

              {profile.resume && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-sm">
                  <CheckCircle2 size={14} />
                  Uploaded
                </span>
              )}
            </div>

            {profile.resume ? (
              <>
                <div className="flex gap-4 items-center">

                  <div className="w-12 h-14 rounded-lg bg-red-400/10 border border-red-400/30 flex items-center justify-center text-red-400">
                    <FileText />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {profile.resume.fileName ||
                        "Resume.pdf"}
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      {profile.resume.uploadedAt
                        ? `Uploaded on ${new Date(
                            profile.resume.uploadedAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}`
                        : "Uploaded"}
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">

                  <a
                    href={
                      profile.resume.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-center py-2.5 rounded-lg border border-slate-600 hover:bg-slate-800 transition"
                  >
                    View
                  </a>

                  <button
                    onClick={() =>
                      resumeInput.current?.click()
                    }
                    className="py-2.5 rounded-lg border border-yellow-500/70 text-yellow-400 hover:bg-yellow-500/10 transition"
                  >
                    Replace
                  </button>

                  <button
                    onClick={deleteResume}
                    className="py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                  >
                    Delete
                  </button>

                </div>
              </>
            ) : (
              <button
                onClick={() =>
                  resumeInput.current?.click()
                }
                className="w-full border border-dashed border-slate-600 rounded-xl p-7 hover:border-blue-400 hover:bg-blue-400/5 transition"
              >
                <Upload
                  className="mx-auto mb-3 text-blue-400"
                />

                <p className="font-medium">
                  Upload your resume
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  PDF up to 10 MB
                </p>
              </button>
            )}

            <input
              ref={resumeInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                if (file) {
                  uploadResume(file);
                }

                event.target.value = "";
              }}
            />

            {resumeUploading && (
              <p className="text-sm text-blue-400 mt-4">
                Uploading resume...
              </p>
            )}

          </div>
        </section>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-9">

          <StatCard
            icon={Sparkles}
            value={portfolio.skills.length}
            label="Skills"
          />

          <StatCard
            icon={Users}
            value={portfolio.evidence.length}
            label="Proof of Work"
          />

          <StatCard
            icon={ShieldCheck}
            value={
              portfolio
                .academicCredentials
                .length
            }
            label="Academic Credentials"
          />

          <StatCard
            icon={UserRound}
            value={
              portfolio.assessments.length
            }
            label="Assessments"
          />

        </section>

        {/* ================================================= */}
        {/* SKILLS */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-slate-700/60 bg-[#10182d] p-6 lg:p-7 mb-5">

          <div className="flex justify-between items-start mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                What I can do
              </h2>

              <p className="text-slate-400 text-sm mt-2">
                Skills developed through learning,
                projects, assessments and real-world
                evidence.
              </p>
            </div>

            <button
              onClick={() =>
                setSkillModal(true)
              }
              className="print:hidden p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
            >
              <Plus size={20} />
            </button>

          </div>

          {portfolio.skills.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No skills added yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {portfolio.skills.map(
                (skill) => (
                  <div
                    key={skill.id}
                    className="rounded-xl bg-[#17213b] border border-slate-700/50 p-4"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />

                        <span className="font-medium">
                          {skill.name}
                        </span>
                      </div>

                      <span className="text-sm font-medium">
                        {Math.round(
                          skill.proficiency
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-700 mt-4 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-400"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              skill.proficiency
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-3 text-sm">

                      <span className="text-slate-400">
                        {competency(
                          skill.competencyLevel
                        )}
                      </span>

                      {skill.verificationStrength !==
                        "UNVERIFIED" && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2
                            size={14}
                          />
                          Verified
                        </span>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* ================================================= */}
        {/* EVIDENCE */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-slate-700/60 bg-[#10182d] p-6 lg:p-7">

          <div className="flex justify-between items-start mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                Things that prove my skills
              </h2>

              <p className="text-slate-400 text-sm mt-2">
                Projects, certifications,
                internships and other evidence
                connected to your capabilities.
              </p>
            </div>

            <button
              onClick={() =>
                setEvidenceModal(true)
              }
              className="print:hidden p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
            >
              <Plus size={20} />
            </button>

          </div>

          {portfolio.evidence.length ===
          0 ? (
            <div className="py-12 text-center text-slate-500">
              No proof of work added yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">

              {portfolio.evidence.map(
                (item) => {
                  const Icon =
                    evidenceIcon(
                      item.type
                    );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#17213b] border border-slate-700/50 p-4 flex flex-col min-h-[230px]"
                    >

                      <div className="flex items-center justify-between mb-4">

                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Icon size={18} />
                        </div>

                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                          {evidenceLabels[
                            item.type
                          ] ||
                            item.type}
                        </span>

                      </div>

                      <h3 className="font-semibold leading-5">
                        {item.title}
                      </h3>

                      {item.skill && (
                        <p className="text-xs text-blue-400 mt-2">
                          {item.skill.name}
                        </p>
                      )}

                      <p className="text-sm text-slate-400 leading-6 mt-3 flex-1">
                        {item.description ||
                          "Evidence submitted to demonstrate this capability."}
                      </p>

                      <div className="flex items-center justify-between mt-5">

                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
                          >
                            <Link2
                              size={14}
                            />

                            View Proof
                          </a>
                        ) : (
                          <span className="text-sm text-slate-600">
                            No proof link
                          </span>
                        )}

                        {item.verified && (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-400"
                          />
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>

      {/* =================================================== */}
      {/* SKILL MODAL */}
      {/* =================================================== */}

      {skillModal && (
        <SkillModal
          skills={portfolio.skills}
          loading={skillLoading}
          onClose={() =>
            setSkillModal(false)
          }
          onSubmit={addSkill}
        />
      )}

      {/* =================================================== */}
      {/* EVIDENCE MODAL */}
      {/* =================================================== */}

      {evidenceModal && (
        <EvidenceModal
          skills={portfolio.skills}
          loading={evidenceLoading}
          onClose={() =>
            setEvidenceModal(false)
          }
          onSubmit={addEvidence}
        />
      )}
    </main>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-[#10182d] p-5 flex items-center gap-5">

      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
        <Icon size={23} />
      </div>

      <div>
        <div className="text-2xl font-semibold">
          {value}
        </div>

        <div className="text-sm text-slate-400 mt-1">
          {label}
        </div>
      </div>

    </div>
  );
}

// ============================================================
// SKILL MODAL
// ============================================================

function SkillModal({
  skills,
  loading,
  onClose,
  onSubmit,
}: {
  skills: Skill[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    skillId: string,
    proficiency: number,
    level: string
  ) => void;
}) {
  const [skillId, setSkillId] =
    useState("");

  const [proficiency, setProficiency] =
    useState(70);

  const [level, setLevel] =
    useState("INTERMEDIATE");

  return (
    <Modal
      title="Add Skill"
      onClose={onClose}
    >

      <div className="space-y-5">

        <div>
          <label className="label">
            Skill
          </label>

          <select
            value={skillId}
            onChange={(e) =>
              setSkillId(e.target.value)
            }
            className="input"
          >
            <option value="">
              Select a skill
            </option>

            {skills.length === 0 ? (
              <option disabled>
                No available skills
              </option>
            ) : (
              skills.map((skill) => (
                <option
                  key={skill.id}
                  value={skill.id}
                >
                  {skill.name}
                </option>
              ))
            )}
          </select>

          <p className="text-xs text-slate-500 mt-2">
            Skills already in your profile are
            shown here.
          </p>
        </div>

        <div>
          <div className="flex justify-between">
            <label className="label">
              Proficiency
            </label>

            <span className="text-blue-400">
              {proficiency}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={proficiency}
            onChange={(e) =>
              setProficiency(
                Number(e.target.value)
              )
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="label">
            Competency Level
          </label>

          <select
            value={level}
            onChange={(e) =>
              setLevel(e.target.value)
            }
            className="input"
          >
            <option value="EXPOSURE">
              Exposure
            </option>

            <option value="FOUNDATIONAL">
              Foundational
            </option>

            <option value="INTERMEDIATE">
              Intermediate
            </option>

            <option value="ADVANCED">
              Advanced
            </option>

            <option value="EXPERT">
              Expert
            </option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-3">

          <button
            onClick={onClose}
            className="modal-secondary"
          >
            Cancel
          </button>

          <button
            disabled={
              !skillId || loading
            }
            onClick={() =>
              onSubmit(
                skillId,
                proficiency,
                level
              )
            }
            className="modal-primary"
          >
            {loading
              ? "Adding..."
              : "Add Skill"}
          </button>

        </div>

      </div>
    </Modal>
  );
}

// ============================================================
// EVIDENCE MODAL
// ============================================================

function EvidenceModal({
  skills,
  loading,
  onClose,
  onSubmit,
}: {
  skills: Skill[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    form: FormData
  ) => void;
}) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [type, setType] =
    useState("PROJECT");

  const [skillId, setSkillId] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  function submit() {
    if (!title.trim()) {
      alert(
        "Please enter a title."
      );
      return;
    }

    if (!skillId) {
      alert(
        "Please select a related skill."
      );
      return;
    }

    if (!file) {
      alert(
        "Please upload proof."
      );
      return;
    }

    const form =
      new FormData();

    form.append(
      "title",
      title
    );

    form.append(
      "description",
      description
    );

    form.append(
      "type",
      type
    );

    form.append(
      "skillId",
      skillId
    );

    form.append(
      "url",
      url
    );

    form.append(
      "file",
      file
    );

    onSubmit(form);
  }

  return (
    <Modal
      title="Add Proof of Work"
      onClose={onClose}
    >

      <div className="space-y-4">

        <div>
          <label className="label">
            Type
          </label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
            className="input"
          >
            <option value="PROJECT">
              Project
            </option>

            <option value="CERTIFICATION">
              Certification
            </option>

            <option value="INTERNSHIP">
              Internship
            </option>

            <option value="NPTEL">
              NPTEL
            </option>

            <option value="ASSESSMENT">
              Assessment
            </option>

            <option value="SELF_REPORTED">
              Other
            </option>
          </select>
        </div>

        <div>
          <label className="label">
            Title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="e.g. SkillSetu Platform"
            className="input"
          />
        </div>

        <div>
          <label className="label">
            Related Skill
          </label>

          <select
            value={skillId}
            onChange={(e) =>
              setSkillId(e.target.value)
            }
            className="input"
          >
            <option value="">
              Select skill
            </option>

            {skills.map((skill) => (
              <option
                key={skill.id}
                value={skill.id}
              >
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            rows={4}
            placeholder="Briefly describe this achievement..."
            className="input resize-none"
          />
        </div>

        <div>
          <label className="label">
            URL
          </label>

          <input
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            placeholder="https://..."
            className="input"
          />
        </div>

        <div>
          <label className="label">
            Upload Proof
          </label>

          <label className="border border-dashed border-slate-600 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-400/5 transition">

            <Upload
              className="text-blue-400 mb-2"
            />

            <span className="text-sm">
              {file
                ? file.name
                : "Choose PDF or image"}
            </span>

            <span className="text-xs text-slate-500 mt-1">
              Maximum 10 MB
            </span>

            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] ||
                    null
                )
              }
            />

          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3">

          <button
            onClick={onClose}
            className="modal-secondary"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="modal-primary"
          >
            {loading
              ? "Uploading..."
              : "Add Evidence"}
          </button>

        </div>

      </div>
    </Modal>
  );
}

// ============================================================
// MODAL
// ============================================================

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">

      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#10182d] shadow-2xl">

        <div className="sticky top-0 bg-[#10182d] border-b border-slate-700 px-6 py-5 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X />
          </button>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
}