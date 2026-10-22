import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fieldErrorsFromZod, judgeRegisterSchema } from "@/lib/validators";
import { jsonError } from "@/server/errors";

export async function POST(request: Request) {
  try {
    const parsed = judgeRegisterSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing?.role === "PARTICIPANT") {
      return NextResponse.json(
        { error: "This email is already a participant account.", fieldErrors: { email: "This email is already a participant account." } },
        { status: 409 },
      );
    }
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists.", fieldErrors: { email: "An account with this email already exists." } },
        { status: 409 },
      );
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "JUDGE" },
      select: { id: true, email: true, name: true, role: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
