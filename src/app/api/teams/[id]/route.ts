import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/security";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { saveTeam } from "@/server/teams";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser("PARTICIPANT");
    const { id } = await context.params;
    const team = await saveTeam(user.id, await readJsonBody(request), id);
    return NextResponse.json({ team });
  } catch (error) {
    return jsonError(error);
  }
}
