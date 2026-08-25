import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Check whether the user is authenticated
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get the user's Clerk profile
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 }
      );
    }

    // 3. Get name and email from Clerk
    const email = clerkUser.emailAddresses[0]?.emailAddress;

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

    // 4. Check if this user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        studentProfile: true,
      },
    });

    // 5. If user already exists, return them
    if (existingUser) {
      return NextResponse.json({
        message: "User already synced",
        user: existingUser,
      });
    }

    // 6. Create SkillSetu user
    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        name,
        email,
        role: "STUDENT",

        studentProfile: {
          create: {},
        },
      },
      include: {
        studentProfile: true,
      },
    });

    return NextResponse.json(
      {
        message: "User synced successfully",
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