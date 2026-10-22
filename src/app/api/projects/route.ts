import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/security";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { saveIdea } from "@/server/projects";

export async function POST(request: Request) {
  try {
    const user = await requireUser("PARTICIPANT");
    const project = await saveIdea(user.id, await readJsonBody(request));
    return NextResponse.json({ project });
  } catch (error) {
    return jsonError(error);
  }
}
