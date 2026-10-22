import { LeaderboardTable } from "@/components/data-tables";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/server/guards";
import { getLeaderboard } from "@/server/read";

export default async function LeaderboardPage() {
  await requireUser("JUDGE");
  const leaderboard = await getLeaderboard();

  return (
    <div>
      <PageHeader
        kicker="Results"
        title="Leaderboard"
        description={`Rankings update whenever a judge submits or edits a score. This page is only available to judges.${leaderboard.blindJudging ? " Blind judging is on, so teams are shown by number." : ""}`}
      />
      <LeaderboardTable rows={leaderboard.rows} />
    </div>
  );
}
