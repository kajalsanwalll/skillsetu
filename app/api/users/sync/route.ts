import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Authenticate with Clerk
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get Clerk user
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 }
      );
    }

    const email =
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const name =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || "SkillSetu User";

    // 3. Check whether SkillSetu user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: true,
        opportunities: true,
      },
    });

    // 4. Existing user
    if (existingUser) {
      return NextResponse.json({
        success: true,
        userExists: true,
        user: existingUser,
      });
    }

    // 5. New user
    //
    // We intentionally do NOT select a role here.
    // The user will select their role on /setup.
    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        name,
        email,
      },
      include: {
        studentProfile: true,
        opportunities: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        userExists: false,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("USER_SYNC_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to sync user",
      },
      { status: 500 }
    );
  }
}