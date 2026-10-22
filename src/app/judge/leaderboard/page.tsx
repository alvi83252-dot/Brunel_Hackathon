import { LeaderboardTable } from "@/components/data-tables";
import { requireUser } from "@/server/guards";
import { getLeaderboard } from "@/server/read";

export default async function LeaderboardPage() {
  await requireUser("JUDGE");
  const leaderboard = await getLeaderboard();

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Rankings update whenever a judge submits or edits a score. This page is only available to judges.
          {leaderboard.blindJudging ? " Blind judging is on, so teams are shown by number." : ""}
        </p>
      </div>
      <LeaderboardTable rows={leaderboard.rows} />
    </div>
  );
}
