import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { connectDB } from "@/lib/db/connection";
import { Call } from "@/lib/db/models/Call";
import { Rep } from "@/lib/db/models/Rep";
import { User } from "@/lib/db/models/User";

const deleteSchema = z.object({
  confirm: z.string().min(1, "Confirmation text is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const parsed = deleteSchema.parse(body);

    if (parsed.confirm.trim().toLowerCase() !== "delete") {
      return NextResponse.json(
        createErrorResponse('You must type "delete" to confirm account deletion', "CONFIRMATION_REQUIRED"),
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Delete all related data for this user
    await Promise.all([
      Call.deleteMany({ userId: userObjectId }),
      Rep.deleteMany({ userId: userObjectId }),
    ]);

    await User.deleteOne({ _id: userObjectId });

    return NextResponse.json(createSuccessResponse({}), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(error.errors[0]?.message ?? "Invalid input", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    console.error("Error deleting account:", error);
    return NextResponse.json(
      createErrorResponse("Failed to delete account", "DELETE_ACCOUNT_ERROR"),
      { status: 500 }
    );
  }
}


