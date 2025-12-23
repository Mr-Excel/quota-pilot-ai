import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RepsRepo } from "@/lib/repos/RepsRepo";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { z } from "zod";
import { AppError } from "@/lib/errors";

const createRepSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  region: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const reps = await RepsRepo.findByUserId(session.user.id);
    return NextResponse.json(createSuccessResponse(reps));
  } catch (error) {
    console.error("Error fetching reps:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to fetch reps"),
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
    const validated = createRepSchema.parse(body);

    const rep = await RepsRepo.create({
      userId: session.user.id,
      ...validated,
    });

    return NextResponse.json(createSuccessResponse(rep), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(error.errors[0].message, "VALIDATION_ERROR"),
        { status: 400 }
      );
    }
    console.error("Error creating rep:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to create rep"),
      { status: 500 }
    );
  }
}

