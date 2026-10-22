import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/server/guards";
import { getAwards } from "@/server/read";

export default async function AwardsPage() {
  await requireUser("JUDGE");
  const awards = await getAwards();

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Awards</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Winners are calculated from submitted scores. A team needs a final repository submission and at least one submitted score. Placements break ties by earlier submission, then team number.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {awards.rows.map((award) => (
          <Card key={award.type}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{award.title}</CardTitle>
                {award.team ? <Badge variant="accent">{award.criterion ? `${award.score?.toFixed(2)} / 10` : `${award.score?.toFixed(2)} / 100`}</Badge> : <Badge>Open</Badge>}
              </div>
              <CardDescription>{award.rule}</CardDescription>
            </CardHeader>
            <CardContent>
              {award.team ? (
                <p>
                  <span className="font-bold">{award.team}</span>
                  <span className="text-muted-foreground"> · {award.projectTitle} · {award.track}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No eligible project yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
