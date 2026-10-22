import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/security";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { getOwnedTeam, saveTeam } from "@/server/teams";

export async function GET() {
  try {
    const user = await requireUser("PARTICIPANT");
    const team = await getOwnedTeam(user.id);
    return NextResponse.json({ team });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser("PARTICIPANT");
    const team = await saveTeam(user.id, await readJsonBody(request));
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
