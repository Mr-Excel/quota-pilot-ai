import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UsersRepo } from "@/lib/repos/UsersRepo";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.parse(body);

    const existing = await UsersRepo.findByEmail(parsed.email);
    if (existing) {
      return NextResponse.json(
        createErrorResponse("An account with this email already exists", "EMAIL_TAKEN"),
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    const user = await UsersRepo.create({
      email: parsed.email,
      name: parsed.name,
      passwordHash,
      role: "manager",
    });

    // Do not return sensitive fields
    return NextResponse.json(
      createSuccessResponse({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(error.errors[0]?.message ?? "Invalid input", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    console.error("Error during signup:", error);
    return NextResponse.json(
      createErrorResponse("Failed to create account", "SIGNUP_ERROR"),
      { status: 500 }
    );
  }
}


