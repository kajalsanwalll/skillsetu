
import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSetu",
  description:
    "AI-powered skill intelligence connecting students, industry, and opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#07070b] text-white">
        <ClerkProvider>
          {/* Global Navigation */}
          <header className="fixed left-0 right-0 top-0 z-50">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
              {/* Logo */}
              <a
                href="/"
                className="text-xl font-bold tracking-tight transition hover:opacity-80"
              >
                skill<span className="text-purple-400">setu</span>
              </a>

              {/* Authentication Actions */}
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <SignInButton>
                    <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white">
                      Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton>
                    <button className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 hover:shadow-purple-500/30">
                      Get Started
                    </button>
                  </SignUpButton>
                </Show>

                <Show when="signed-in">
                  <div className="rounded-full border border-white/10 bg-white/[0.05] p-1">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-9 w-9",
                        },
                      }}
                    />
                  </div>
                </Show>
              </div>
            </div>

            {/* Navigation border */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </header>

          {/* Background */}
          <div className="relative min-h-screen overflow-hidden">
            {/* Purple ambient glow */}
            <div className="pointer-events-none fixed inset-0">
              <div className="absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[150px]" />
              <div className="absolute bottom-[-300px] left-[-200px] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[140px]" />
              <div className="absolute bottom-[-300px] right-[-200px] h-[500px] w-[500px] rounded-full bg-purple-600/5 blur-[140px]" />
            </div>

            {/* Subtle grid */}
            <div
              className="pointer-events-none fixed inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            {/* Page Content */}
            <div className="relative pt-20">{children}</div>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}

