import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/security";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { saveSubmission } from "@/server/submissions";

export async function POST(request: Request) {
  try {
    const user = await requireUser("PARTICIPANT");
    const submission = await saveSubmission(user.id, await readJsonBody(request));
    return NextResponse.json({ submission });
  } catch (error) {
    return jsonError(error);
  }
}
