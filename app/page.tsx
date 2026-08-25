import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">
            AI-POWERED SKILL INTELLIGENCE
          </p>

          <h1 className="text-5xl font-bold tracking-tight mt-3">
            SkillSetu
          </h1>

          <p className="text-gray-600 mt-4 max-w-xl">
            Connect industry demand, student skills and academia
            through intelligent skill matching.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-black px-5 py-3 text-white"
          >
            Get Started
          </Link>

          <Link
            href="/sign-in"
            className="rounded-lg border px-5 py-3"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}