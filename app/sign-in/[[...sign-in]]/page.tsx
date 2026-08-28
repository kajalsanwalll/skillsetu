import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
      <SignIn
        forceRedirectUrl="/onboarding"
      />
    </main>
  );
}
