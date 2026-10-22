import { NextResponse } from "next/server";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { saveSubmission } from "@/server/submissions";

export async function POST(request: Request) {
  try {
    const user = await requireUser("PARTICIPANT");
    const submission = await saveSubmission(user.id, await request.json());
    return NextResponse.json({ submission });
  } catch (error) {
    return jsonError(error);
  }
}
