import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppError, jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { saveSubmission } from "@/server/submissions";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser("PARTICIPANT");
    const { id } = await context.params;
    const owned = await prisma.submission.findFirst({ where: { id, project: { team: { ownerId: user.id } } } });
    if (!owned) throw new AppError("That submission is not yours.", 404);
    const submission = await saveSubmission(user.id, await request.json());
    return NextResponse.json({ submission });
  } catch (error) {
    return jsonError(error);
  }
}
