import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UsersRepo } from "@/lib/repos/UsersRepo";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await UsersRepo.findByEmail(credentials.email as string);
        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash as string);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  // Trust host for Vercel deployment (NextAuth v5 requirement)
  trustHost: true,
  // Let NextAuth v5 handle cookies automatically - it detects production and sets secure cookies
  // No need to manually configure cookie names for v5
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: any, baseUrl: any }) {
      // If redirecting to login, go to dashboard instead
      if (url.includes("/login")) {
        return `${baseUrl}/dashboard`;
      }
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If it's already an absolute URL on our domain, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};

// Export auth function for NextAuth v5
export const { auth } = NextAuth(authOptions);

