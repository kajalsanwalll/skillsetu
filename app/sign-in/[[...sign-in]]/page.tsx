import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F1526] px-6 py-12 font-sans">

      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#3A4266] bg-[#171E33] font-serif text-base text-[#F4A93B] setu-node">
          सेतु
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9AA3C0] mb-3">
          Welcome back
        </p>

        <h1 className="font-serif text-3xl font-normal tracking-tight text-[#F5F1E8]">
          Skill<span className="text-[#F4A93B]">Setu</span>
        </h1>
      </div>

      <SignIn
        forceRedirectUrl="/onboarding"
        appearance={{
          variables: {
            colorPrimary: "#F4A93B",
            colorPrimaryForeground: "#0F1526",
            colorBackground: "#171E33",
            colorForeground: "#F5F1E8",
            colorMutedForeground: "#9AA3C0",
            colorInput: "#0F1526",
            colorInputForeground: "#F5F1E8",
            colorDanger: "#E8598B",
            colorSuccess: "#2BA792",
            colorWarning: "#F4A93B",
            colorNeutral: "#C7CCE0",
            borderRadius: "0.75rem",
            fontFamily: '"IBM Plex Sans", sans-serif',
          },
          elements: {
            card: "border border-[#232B47] shadow-none",
            headerTitle: "font-serif text-[#F5F1E8]",
            headerSubtitle: "text-[#9AA3C0]",
            socialButtonsBlockButton:
              "border border-[#232B47] bg-[#0F1526] hover:bg-[#1B2340] text-[#F5F1E8]",
            dividerLine: "bg-[#232B47]",
            dividerText: "text-[#5B6386]",
            formFieldLabel: "text-[#9AA3C0]",
            formFieldInput:
              "border border-[#232B47] bg-[#0F1526] text-[#F5F1E8] focus:border-[#F4A93B]",
            formButtonPrimary:
              "bg-[#F4A93B] text-[#0F1526] hover:bg-[#f7b85e] normal-case",
            footerActionText: "text-[#9AA3C0]",
            footerActionLink: "text-[#F4A93B] hover:text-[#f7b85e]",
            identityPreviewText: "text-[#F5F1E8]",
            identityPreviewEditButton: "text-[#F4A93B]",
          },
        }}
      />

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz@0,9..144;1,9..144&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap");

        .font-serif {
          font-family: "Fraunces", serif;
        }
        .font-sans {
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
          0%, 100% {
            box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.15),
              0 0 40px 6px rgba(244, 169, 59, 0.12);
          }
          50% {
            box-shadow: 0 0 0 1px rgba(244, 169, 59, 0.25),
              0 0 56px 10px rgba(244, 169, 59, 0.22);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .setu-node {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}