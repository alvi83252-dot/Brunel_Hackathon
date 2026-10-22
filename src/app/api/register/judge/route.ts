import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientKey, enforceRateLimit, readJsonBody, secretsMatch } from "@/lib/security";
import { fieldErrorsFromZod, judgeRegisterSchema } from "@/lib/validators";
import { jsonError } from "@/server/errors";

const PRIVATE = { "Cache-Control": "private, no-store" };

export async function POST(request: Request) {
  try {
    enforceRateLimit(`register-judge:${clientKey(request)}`, 8, 60 * 60 * 1000);
    const parsed = judgeRegisterSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) },
        { status: 400, headers: PRIVATE },
      );
    }
    const invite = process.env.JUDGE_INVITE_CODE?.trim() ?? "";
    if (!secretsMatch(parsed.data.inviteCode, invite)) {
      return NextResponse.json(
        { error: "That invite code is not valid.", fieldErrors: { inviteCode: "That invite code is not valid." } },
        { status: 403, headers: PRIVATE },
      );
    }
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing?.role === "PARTICIPANT") {
      return NextResponse.json(
        { error: "This email is already a participant account.", fieldErrors: { email: "This email is already a participant account." } },
        { status: 409, headers: PRIVATE },
      );
    }
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists.", fieldErrors: { email: "An account with this email already exists." } },
        { status: 409, headers: PRIVATE },
      );
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "JUDGE" },
      select: { id: true, email: true, name: true, role: true },
    });
    return NextResponse.json({ user }, { status: 201, headers: PRIVATE });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409, headers: PRIVATE });
    }
    return jsonError(error);
  }
}
