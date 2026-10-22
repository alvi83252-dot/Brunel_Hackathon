import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { clientKey, enforceRateLimit } from "@/lib/security";
import { loginSchema } from "@/lib/validators";
import { AppError } from "@/server/errors";

const DUMMY_PASSWORD_HASH = "$2b$12$XC.44j34g.w00803dSFu3uDYGrpl5NHaw0SBDRGOYhuOQX2JQ6y/K";

class TooManyAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}

if (process.env.NODE_ENV === "production" && (process.env.AUTH_SECRET ?? "").trim().length < 16) {
  throw new Error("AUTH_SECRET must be set before this app can run in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const ip = clientKey(request);
          enforceRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
          enforceRateLimit(`login:email:${parsed.data.email}`, 10, 15 * 60 * 1000);
        } catch (error) {
          if (error instanceof AppError && error.status === 429) throw new TooManyAttempts();
          throw error;
        }
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        const matches = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
        if (!user || !matches) return null;
        if (user.role !== "JUDGE" && user.role !== "PARTICIPANT") return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
