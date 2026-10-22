import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";

export async function GET() {
  try {
    const user = await requireUser("PARTICIPANT");
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, type: true, subject: true, text: true, toEmail: true, delivery: true, createdAt: true },
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    return jsonError(error);
  }
}
