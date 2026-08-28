
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_50%)]" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">

        {/* Left Section */}
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-20">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <span className="text-lg font-bold">S</span>
              </div>

              <span className="text-xl font-semibold tracking-tight">
                SkillSetu
              </span>
            </div>
          </div>

          {/* Hero */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              Welcome back
            </div>

            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight">
              Your next
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                opportunity awaits.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-400">
              Sign in to continue building your profile, discover
              opportunities, and connect with companies looking for talent.
            </p>

            {/* Highlights */}
            <div className="mt-10 space-y-5">
              {[
                {
                  title: "Find the right opportunities",
                  description:
                    "Discover internships, projects and jobs matched to your skills.",
                },
                {
                  title: "Keep your profile ready",
                  description:
                    "Showcase your skills and experience to potential employers.",
                },
                {
                  title: "Grow your career",
                  description:
                    "Connect with industry and turn your skills into real opportunities.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/15">
                    <svg
                      className="h-3.5 w-3.5 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-medium text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} SkillSetu. All rights reserved.
          </p>
        </section>

        {/* Right Section */}
        <section className="flex items-center justify-center px-6 py-12 lg:px-12">

          {/* Mobile Logo */}
          <div className="absolute left-6 top-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="font-bold">S</span>
            </div>

            <span className="font-semibold">
              SkillSetu
            </span>
          </div>

          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Sign in to continue to SkillSetu.
              </p>
            </div>

            {/* Clerk Sign In */}
            <div className="flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",

                    cardBox: "shadow-none",

                    card: `
                      w-full
                      bg-[#111218]
                      border border-white/10
                      rounded-2xl
                      shadow-2xl
                      shadow-black/40
                    `,

                    headerTitle: "hidden",
                    headerSubtitle: "hidden",

                    socialButtonsBlockButton: `
                      bg-white/[0.04]
                      border-white/10
                      text-white
                      hover:bg-white/[0.08]
                      transition-all
                    `,

                    socialButtonsBlockButtonText: `
                      text-white
                      font-medium
                    `,

                    dividerLine: "bg-white/10",

                    dividerText: "text-gray-500",

                    formFieldLabel: "text-gray-300",

                    formFieldInput: `
                      bg-[#0b0c10]
                      border-white/10
                      text-white
                      placeholder:text-gray-600
                      focus:border-indigo-500
                      focus:ring-1
                      focus:ring-indigo-500
                    `,

                    formButtonPrimary: `
                      bg-gradient-to-r
                      from-indigo-500
                      to-purple-600
                      hover:from-indigo-400
                      hover:to-purple-500
                      text-white
                      font-semibold
                      shadow-lg
                      shadow-indigo-500/20
                      transition-all
                    `,

                    footerActionLink: `
                      text-indigo-400
                      hover:text-indigo-300
                    `,

                    identityPreviewText: "text-gray-300",

                    formFieldSuccessText: "text-emerald-400",

                    formFieldErrorText: "text-red-400",

                    alert: `
                      bg-red-500/10
                      border-red-500/20
                      text-red-300
                    `,
                  },
                }}
              />
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs leading-5 text-gray-600">
              By signing in, you agree to our Terms of Service
              and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

