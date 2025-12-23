import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Skip middleware for login and signup pages
  if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
    return NextResponse.next();
  }

  // Use process.env directly (Edge runtime safe, avoids importing lib/env which may trigger model loading)
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("NEXTAUTH_SECRET is not set");
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // Check if we're in production (Vercel sets VERCEL=1)
  const isProduction = process.env.VERCEL === "1" || req.url.includes("vercel.app");
  
  // NextAuth v5 beta uses __Secure-authjs.session-token in production
  // Try the production cookie name first
  let token = await getToken({
    req,
    secret,
    cookieName: isProduction ? "__Secure-authjs.session-token" : "next-auth.session-token",
  });

  // If no token found, try the alternative cookie name
  if (!token) {
    token = await getToken({
      req,
      secret,
      cookieName: isProduction ? "next-auth.session-token" : "__Secure-authjs.session-token",
    });
  }

  // If still no token, try auto-detection (let NextAuth figure it out)
  if (!token) {
    token = await getToken({
      req,
      secret,
    });
  }

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

