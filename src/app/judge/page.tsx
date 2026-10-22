import { Countdown } from "@/components/countdown";
import { JudgeCharts } from "@/components/judge-charts";
import { MetricStrip, PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { CRITERIA } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/guards";
import { getSettings } from "@/server/settings";

export default async function JudgeDashboard() {
  const judge = await requireUser("JUDGE");
  const settings = await getSettings();
  const [teamCount, ideaCount, finalCount, scoreCount, judgeCount, scoredByMe, tracks] = await Promise.all([
    prisma.team.count(),
    prisma.project.count(),
    prisma.submission.count(),
    prisma.judgeScore.count({ where: { status: "SUBMITTED" } }),
    prisma.user.count({ where: { role: "JUDGE" } }),
    prisma.judgeScore.count({ where: { judgeId: judge.id, status: "SUBMITTED" } }),
    prisma.track.findMany({
      orderBy: { name: "asc" },
      include: { projects: { include: { scores: { where: { status: "SUBMITTED", weightedScore: { not: null } } } } } },
    }),
  ]);

  const shortNames: Record<string, string> = {
    ai: "AI",
    sustainability: "Sustainability",
    health: "Health",
    education: "Education",
    campus: "Campus",
    open: "Open",
  };
  const chartTracks = tracks.map((track) => {
    const scores = track.projects.flatMap((project) => project.scores.map((score) => score.weightedScore ?? 0));
    const average = scores.length ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 100) / 100 : 0;
    return { track: shortNames[track.slug] ?? track.name, average, teams: track.projects.length };
  });
  const progress = ideaCount ? Math.round((scoredByMe / ideaCount) * 100) : 0;

  return (
    <div>
      <PageHeader
        kicker="Judging"
        title="Overview"
        description={settings.blindJudging ? "Blind judging is on. Team identities are hidden." : "Blind judging is off. Team names are visible."}
      />
      <MetricStrip
        items={[
          { label: "Teams", value: String(teamCount) },
          { label: "Ideas", value: String(ideaCount) },
          { label: "Repositories", value: String(finalCount) },
          { label: "Scores", value: `${scoreCount} from ${judgeCount} judges` },
        ]}
      />

      <section className="mt-10 grid gap-10 border-b border-border pb-10 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold">Your scoring</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {scoredByMe} of {ideaCount} project{ideaCount === 1 ? "" : "s"} submitted.
          </p>
          <div className="mt-4">
            <Progress value={progress} label={`${scoredByMe} of ${ideaCount} projects scored`} />
            <p className="mt-2 text-xs tabular-nums text-muted-foreground">{progress}%</p>
          </div>
        </div>
        <Countdown deadline={settings.judgingDeadline.toISOString()} label="Judging closes" />
      </section>

      <div className="mt-10">
        <JudgeCharts
          tracks={chartTracks}
          funnel={[
            { stage: "Teams", count: teamCount },
            { stage: "Ideas", count: ideaCount },
            { stage: "Repositories", count: finalCount },
            { stage: "Scores", count: scoreCount },
          ]}
        />
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold">How a score becomes a ranking</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A judge’s weighted score is the sum of score × weight, multiplied by 10 so it reads out of 100. The leaderboard averages every submitted judge score.
        </p>
        <div className="mt-4 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Criterion</th>
                <th className="px-4 py-3 font-semibold">Weight</th>
                <th className="px-4 py-3 font-semibold">What it measures</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((criterion) => (
                <tr key={criterion.key} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-semibold">{criterion.label}</td>
                  <td className="px-4 py-3 tabular-nums">{Math.round(criterion.weight * 100)}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{criterion.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
