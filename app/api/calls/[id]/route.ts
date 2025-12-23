import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CallsService } from "@/lib/services/CallsService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    const call = await CallsService.getCall(id, session.user.id);
    return NextResponse.json(createSuccessResponse(call));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }
    console.error("Error fetching call:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to fetch call"),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const call = await CallsService.updateCall(id, session.user.id, body);
    return NextResponse.json(createSuccessResponse(call));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }
    console.error("Error updating call:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to update call"),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    await CallsService.deleteCall(id, session.user.id);
    return NextResponse.json(createSuccessResponse({ success: true }));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }
    console.error("Error deleting call:", error);
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : "Failed to delete call"),
      { status: 500 }
    );
  }
}

