import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppError, jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { saveIdea } from "@/server/projects";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser("PARTICIPANT");
    const { id } = await context.params;
    const owned = await prisma.project.findFirst({ where: { id, team: { ownerId: user.id } } });
    if (!owned) throw new AppError("That project is not yours.", 404);
    const project = await saveIdea(user.id, await request.json());
    return NextResponse.json({ project });
  } catch (error) {
    return jsonError(error);
  }
}
