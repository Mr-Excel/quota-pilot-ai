import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { isGroqAvailable } from "@/lib/ai/groq";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    return NextResponse.json(
      createSuccessResponse({
        available: isGroqAvailable(),
      })
    );
  } catch (error) {
    console.error("Error checking AI status:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to check AI status"),
      { status: 500 }
    );
  }
}

