import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
//import { extractOpportunity } from "@/lib/ai/extract-opportunity";
import { MockAIProvider } from "@/lib/ai/mock-provider";
const requestSchema = z.object({
  jobDescription: z
    .string()
    .min(50, "Job description is too short"),
});

export async function POST(request: Request) {
  try {
    const { isAuthenticated, userId } = await auth();

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ??
            "Invalid request",
        },
        { status: 400 }
      );
    }

   // const extracted = await extractOpportunity(
   //   result.data.jobDescription
   // );

    const provider = new MockAIProvider();

const extracted = await provider.extractOpportunity(
  result.data.jobDescription
);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error) {
    console.error(
      "OPPORTUNITY_EXTRACTION_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to extract opportunity requirements",
      },
      { status: 500 }
    );
  }
}