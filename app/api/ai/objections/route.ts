import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AiService } from "@/lib/services/AiService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { z } from "zod";
import { AppError } from "@/lib/errors";

const objectionsSchema = z.object({
  callId: z.string().min(1, "Call ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const validated = objectionsSchema.parse(body);

    const result = await AiService.detectObjections(validated.callId, session.user.id);
    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(error.errors[0].message, "VALIDATION_ERROR"),
        { status: 400 }
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }
    console.error("Error detecting objections:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to detect objections"),
      { status: 500 }
    );
  }
}

