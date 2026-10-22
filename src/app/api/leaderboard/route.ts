import { NextResponse } from "next/server";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { getLeaderboard } from "@/server/read";

export async function GET(request: Request) {
  try {
    await requireUser("JUDGE");
    const track = new URL(request.url).searchParams.get("track") ?? undefined;
    const leaderboard = await getLeaderboard(track || undefined);
    return NextResponse.json(leaderboard);
  } catch (error) {
    return jsonError(error);
  }
}
