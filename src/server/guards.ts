import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors";

type Role = "PARTICIPANT" | "JUDGE";

function asRole(role: string): Role | null {
  if (role === "JUDGE" || role === "PARTICIPANT") return role;
  return null;
}

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, studentId: true, role: true },
  });
  if (!user || !asRole(user.role)) return null;
  return { ...user, role: asRole(user.role)! };
}

async function clearStaleSession() {
  await signOut({ redirectTo: "/login" });
}

export async function redirectIfSignedIn() {
  const session = await auth();
  if (!session?.user?.id) return;
  const user = await currentUser();
  if (!user) await clearStaleSession();
  redirect(user!.role === "JUDGE" ? "/judge" : "/participant");
}

export async function requirePageUser(role: Role) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await currentUser();
  if (!user) await clearStaleSession();
  if (user!.role !== role) redirect(user!.role === "JUDGE" ? "/judge" : "/participant");
  return user!;
}

export async function requireUser(role?: Role) {
  const session = await auth();
  if (!session?.user?.id) throw new AppError("Sign in required.", 401);
  const user = await currentUser();
  if (!user) throw new AppError("Sign in required.", 401);
  if (role && user.role !== role) throw new AppError("You do not have access to this area.", 403);
  return user;
}
