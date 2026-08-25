import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SyncUser from "@/components/auth/SyncUser";

export default async function OnboardingPage() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <>
      <SyncUser />

      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Setting up your SkillSetu profile...
          </h1>

          <p className="mt-2 text-gray-500">
            Just a moment.
          </p>
        </div>
      </main>
    </>
  );
}