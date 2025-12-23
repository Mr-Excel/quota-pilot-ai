// Environment variable validation and access
// Next.js automatically loads .env files, so we just need to validate and export
// This file should only be used on the server side

function getEnv() {
    // Only validate on server side (not in browser)
    if (typeof window !== "undefined") {
        throw new Error("Environment variables are only available on the server");
    }

    const requiredEnvVars = {
        MONGODB_URI: process.env.MONGODB_URI || "",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
        GROQ_API_KEY: process.env.GROQ_API_KEY || "", // Optional
    };

    // Validate required environment variables
    const missingVars: string[] = [];
    if (!requiredEnvVars.MONGODB_URI) missingVars.push("MONGODB_URI");
    if (!requiredEnvVars.NEXTAUTH_SECRET) missingVars.push("NEXTAUTH_SECRET");

    if (missingVars.length > 0) {
        const errorMessage =
            `Missing required environment variables: ${missingVars.join(", ")}\n\n` +
            `Please create a .env file in the root directory with:\n` +
            `MONGODB_URI=mongodb://localhost:27017/closeriq\n` +
            `NEXTAUTH_SECRET=your-secret-key-here\n` +
            `NEXTAUTH_URL=http://localhost:3000\n` +
            `GROQ_API_KEY=your-groq-key-optional\n\n` +
            `Generate NEXTAUTH_SECRET with: openssl rand -base64 32\n\n` +
            `Note: Restart your Next.js dev server after creating/updating .env file`;

        throw new Error(errorMessage);
    }

    return requiredEnvVars;
}

// Lazy evaluation - only validate when accessed (prevents client-side execution)
let cachedEnv: ReturnType<typeof getEnv> | null = null;

export const env = new Proxy({} as ReturnType<typeof getEnv>, {
    get(_target, prop) {
        if (!cachedEnv) {
            cachedEnv = getEnv();
        }
        return cachedEnv[prop as keyof typeof cachedEnv];
    },
});

