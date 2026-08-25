import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold">
        SkillSetu Student Dashboard
      </h1>

      <p className="mt-4 text-gray-600">
        Authentication is working.
      </p>
    </main>
  );
}