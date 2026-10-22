import { Countdown } from "@/components/countdown";
import { JudgeCharts } from "@/components/judge-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Judging overview</h1>
        <p className="mt-1 text-muted-foreground">
          {settings.blindJudging ? "Blind judging is on. Team identities are hidden." : "Blind judging is off. Team names are visible."}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Teams" value={String(teamCount)} />
        <Stat label="Ideas" value={String(ideaCount)} />
        <Stat label="Final submissions" value={String(finalCount)} />
        <Stat label="Submitted scores" value={`${scoreCount} · ${judgeCount} judges`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your scoring</CardTitle>
            <CardDescription>
              {scoredByMe} of {ideaCount} project{ideaCount === 1 ? "" : "s"} submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={ideaCount ? Math.round((scoredByMe / ideaCount) * 100) : 0} label={`${scoredByMe} of ${ideaCount} projects scored`} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Countdown deadline={settings.judgingDeadline.toISOString()} label="Judging closes" />
          </CardContent>
        </Card>
      </div>
      <JudgeCharts
        tracks={chartTracks}
        funnel={[
          { stage: "Teams", count: teamCount },
          { stage: "Ideas", count: ideaCount },
          { stage: "Repositories", count: finalCount },
          { stage: "Scores", count: scoreCount },
        ]}
      />
      <Card>
        <CardContent className="grid gap-2 pt-5 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">How a score becomes a ranking</p>
          {CRITERIA.map((criterion) => (
            <p key={criterion.key}>
              {criterion.label}: {Math.round(criterion.weight * 100)}% — {criterion.description}
            </p>
          ))}
          <p>A judge’s weighted score is the sum of score × weight, multiplied by 10 so it reads out of 100. The leaderboard averages every submitted judge score.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
