import { NextResponse } from "next/server";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { saveScore } from "@/server/scores";

export async function PUT(request: Request) {
  try {
    const user = await requireUser("JUDGE");
    const result = await saveScore(user.id, await request.json());
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
