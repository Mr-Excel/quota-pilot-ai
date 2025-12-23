import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CallsService } from "@/lib/services/CallsService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { z } from "zod";
import { AppError } from "@/lib/errors";

const createCallSchema = z.object({
  repId: z.string().min(1, "Rep ID is required"),
  title: z.string().min(1, "Title is required"),
  occurredAt: z.string().datetime(),
  transcriptText: z.string().min(1, "Transcript text is required"),
  source: z.enum(["paste", "upload"]),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repId = searchParams.get("repId") || undefined;
    const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
    const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;
    const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined;
    const maxScore = searchParams.get("maxScore") ? Number(searchParams.get("maxScore")) : undefined;

    const calls = await CallsService.getCalls(session.user.id, {
      repId,
      from,
      to,
      minScore,
      maxScore,
    });

    return NextResponse.json(createSuccessResponse(calls));
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to fetch calls"),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const validated = createCallSchema.parse(body);

    const call = await CallsService.createCall(session.user.id, {
      ...validated,
      occurredAt: new Date(validated.occurredAt),
    });

    return NextResponse.json(createSuccessResponse(call), { status: 201 });
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
    console.error("Error creating call:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to create call"),
      { status: 500 }
    );
  }
}

