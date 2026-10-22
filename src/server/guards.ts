import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors";

type Role = "PARTICIPANT" | "JUDGE";

export async function requireUser(role?: Role) {
  const session = await auth();
  if (!session?.user?.id) throw new AppError("Sign in required.", 401);
  if (role && session.user.role !== role) throw new AppError("You do not have access to this area.", 403);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new AppError("Sign in required.", 401);
  return user;
}
