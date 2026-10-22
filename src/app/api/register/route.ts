import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientKey, enforceRateLimit, readJsonBody } from "@/lib/security";
import { fieldErrorsFromZod, registerSchema } from "@/lib/validators";
import { jsonError } from "@/server/errors";

const PRIVATE = { "Cache-Control": "private, no-store" };

export async function POST(request: Request) {
  try {
    enforceRateLimit(`register:${clientKey(request)}`, 8, 60 * 60 * 1000);
    const parsed = registerSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) },
        { status: 400, headers: PRIVATE },
      );
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: parsed.data.email }, { studentId: parsed.data.studentId }] },
    });
    if (existing?.role === "JUDGE") {
      return NextResponse.json(
        { error: "This email is reserved for a judge account.", fieldErrors: { email: "This email is reserved for a judge account." } },
        { status: 409, headers: PRIVATE },
      );
    }
    if (existing) {
      const fieldErrors: Record<string, string> = {};
      if (existing.email === parsed.data.email) fieldErrors.email = "An account with this email already exists.";
      if (existing.studentId === parsed.data.studentId) fieldErrors.studentId = "An account with this student ID already exists.";
      return NextResponse.json({ error: "Those details are already registered.", fieldErrors }, { status: 409, headers: PRIVATE });
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, studentId: parsed.data.studentId, passwordHash, role: "PARTICIPANT" },
      select: { id: true, email: true, name: true, role: true },
    });
    return NextResponse.json({ user }, { status: 201, headers: PRIVATE });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Those details are already registered." }, { status: 409, headers: PRIVATE });
    }
    return jsonError(error);
  }
}
