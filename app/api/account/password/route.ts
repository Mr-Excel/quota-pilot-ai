import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { UsersRepo } from "@/lib/repos/UsersRepo";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse("Unauthorized"), { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.parse(body);

    const user = await UsersRepo.findById(session.user.id);
    if (!user) {
      return NextResponse.json(createErrorResponse("User not found"), { status: 404 });
    }

    const isValid = await bcrypt.compare(parsed.currentPassword, user.passwordHash as string);
    if (!isValid) {
      return NextResponse.json(
        createErrorResponse("Current password is incorrect", "INVALID_CURRENT_PASSWORD"),
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(parsed.newPassword, 10);
    await UsersRepo.update(user._id.toString(), { passwordHash: newHash });

    return NextResponse.json(createSuccessResponse({}), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(error.errors[0]?.message ?? "Invalid input", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    console.error("Error changing password:", error);
    return NextResponse.json(
      createErrorResponse("Failed to change password", "CHANGE_PASSWORD_ERROR"),
      { status: 500 }
    );
  }
}


