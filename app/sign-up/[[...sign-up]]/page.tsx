
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
      <SignUp
        forceRedirectUrl="/onboarding"
      />
    </main>
  );
}
