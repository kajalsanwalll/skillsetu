import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Role = "STUDENT" | "INDUSTRY";

export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Read request body
    const body = await req.json();
    const role = body.role as Role;

    // 3. Validate role
    if (role !== "STUDENT" && role !== "INDUSTRY") {
      return NextResponse.json(
        {
          error: "Invalid role. Choose STUDENT or INDUSTRY.",
        },
        { status: 400 }
      );
    }

    // 4. Get Clerk user
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 }
      );
    }

    // 5. Get email
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // 6. Get name
    const name =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || "SkillSetu User";

    // 7. Check whether user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    // 8. If user exists, update role
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          name,
          email,
          role,
          ...(role === "STUDENT" && !existingUser.studentProfile
            ? {
                studentProfile: {
                  create: {},
                },
              }
            : {}),
        },
        include: {
          studentProfile: true,
        },
      });

      return NextResponse.json({
        message: "Setup completed successfully",
        user: updatedUser,
      });
    }

    // 9. Create a new SkillSetu user
    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        name,
        email,
        role,

        ...(role === "STUDENT"
          ? {
              studentProfile: {
                create: {},
              },
            }
          : {}),
      },
      include: {
        studentProfile: true,
      },
    });

    // 10. Return success
    return NextResponse.json(
      {
        message: "Setup completed successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("USER_SETUP_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to complete setup",
      },
      { status: 500 }
    );
  }
}