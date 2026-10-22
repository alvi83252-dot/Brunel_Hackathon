import { NextResponse } from "next/server";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { getLeaderboard } from "@/server/read";

export async function GET(request: Request) {
  try {
    await requireUser("JUDGE");
    const track = new URL(request.url).searchParams.get("track") ?? undefined;
    if (track && !/^[a-z0-9-]{1,40}$/.test(track)) {
      return NextResponse.json({ error: "Unknown track." }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
    }
    const leaderboard = await getLeaderboard(track || undefined);
    return NextResponse.json(leaderboard);
  } catch (error) {
    return jsonError(error);
  }
}
