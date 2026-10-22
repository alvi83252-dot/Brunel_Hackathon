import { NextResponse } from "next/server";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { getAwards } from "@/server/read";

export async function GET() {
  try {
    await requireUser("JUDGE");
    return NextResponse.json(await getAwards());
  } catch (error) {
    return jsonError(error);
  }
}
