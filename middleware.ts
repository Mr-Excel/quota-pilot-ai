import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/lib/env";

export async function middleware(req: NextRequest) {
  // Skip middleware for login and signup pages
  if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
    return NextResponse.next();
  }

  // Let getToken auto-detect the cookie name (NextAuth v5 handles this automatically)
  const token = await getToken({
    req,
    secret: env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

