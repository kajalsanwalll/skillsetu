import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F1526] text-[#F5F1E8]">
      {/* Convergence diagram — the bridge, drawn literally */}
      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lineIndustry" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4A93B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F4A93B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineStudents" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#E8598B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E8598B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineAcademia" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2BA792" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#2BA792" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d="M 60 90 Q 400 260 600 460" stroke="url(#lineIndustry)" strokeWidth="1.5" fill="none" />
        <path d="M 600 40 Q 600 250 600 460" stroke="url(#lineStudents)" strokeWidth="1.5" fill="none" />
        <path d="M 1140 90 Q 800 260 600 460" stroke="url(#lineAcademia)" strokeWidth="1.5" fill="none" />

        <circle r="4" fill="#F4A93B" className="travel-dot" style={{ offsetPath: "path('M 60 90 Q 400 260 600 460')" }} />
        <circle r="4" fill="#E8598B" className="travel-dot travel-dot--b" style={{ offsetPath: "path('M 600 40 Q 600 250 600 460')" }} />
        <circle r="4" fill="#2BA792" className="travel-dot travel-dot--c" style={{ offsetPath: "path('M 1140 90 Q 800 260 600 460')" }} />
      </svg>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9AA3C0]">
          Setu — the point where a bridge is built
        </p>

        <h1 className="mt-4 font-serif text-6xl font-normal tracking-tight sm:text-7xl">
          Skill<span className="text-[#F4A93B]">Setu</span>
        </h1>

        <p className="mt-5 max-w-md text-base text-[#C7CCE0]">
          Industry demand, student skill, and academic curriculum, read as one
          moving picture instead of three disconnected reports.
        </p>

        {/* Three pillars converging on the bridge point */}
        <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
          <Pillar
            color="#F4A93B"
            label="Industry"
            copy="Posts the roles, tools, and timelines it's actually hiring for."
          />
          <Pillar
            color="#E8598B"
            label="Students"
            copy="Maps what they already know against where they want to go."
          />
          <Pillar
            color="#2BA792"
            label="Academia"
            copy="Sees the gap early enough to adjust a syllabus, not a decade."
          />
        </div>

        {/* The bridge point itself — where the three feeds resolve into action */}
        <div className="relative mt-14 flex flex-col items-center">
          <div className="setu-node flex h-16 w-16 items-center justify-center rounded-full border border-[#3A4266] bg-[#171E33] font-serif text-lg text-[#F4A93B]">
            सेतु
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-lg bg-[#F5F1E8] px-6 py-3 text-sm font-medium text-[#0F1526] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A93B]"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg border border-[#3A4266] px-6 py-3 text-sm font-medium text-[#F5F1E8] transition hover:border-[#9AA3C0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A93B]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz@0,9..144;1,9..144&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap");

        .font-serif {
          font-family: "Fraunces", serif;
        }
        body {
          font-family: "IBM Plex Sans", sans-serif;
        }
        .font-mono {
          font-family: "IBM Plex Mono", monospace;
        }

        .setu-node {
          box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.15),
            0 0 40px 6px rgba(244, 169, 59, 0.12);
          animation: setu-pulse 3.2s ease-in-out infinite;
        }

        @keyframes setu-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.15),
              0 0 40px 6px rgba(244, 169, 59, 0.12);
          }
          50% {
            box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.25),
              0 0 56px 10px rgba(244, 169, 59, 0.22);
          }
        }

        .travel-dot {
          offset-rotate: 0deg;
          animation: travel 4.5s linear infinite;
        }
        .travel-dot--b {
          animation-delay: 1.1s;
        }
        .travel-dot--c {
          animation-delay: 2.3s;
        }

        @keyframes travel {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .setu-node,
          .travel-dot {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

function Pillar({
  color,
  label,
  copy,
}: {
  color: string;
  label: string;
  copy: string;
}) {
  return (
    <div className="rounded-xl border border-[#232B47] bg-[#171E33]/60 p-5 text-left">
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-xs uppercase tracking-wide text-[#9AA3C0]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#C7CCE0]">{copy}</p>
    </div>
  );
}