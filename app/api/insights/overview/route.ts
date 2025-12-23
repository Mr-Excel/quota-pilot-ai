import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InsightsService } from "@/lib/services/InsightsService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const overview = await InsightsService.getOverview(session.user.id);
    return NextResponse.json(createSuccessResponse(overview));
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to fetch insights"),
      { status: 500 }
    );
  }
}

