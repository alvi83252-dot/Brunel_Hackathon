import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/server/guards";
import { getAwards } from "@/server/read";

export default async function AwardsPage() {
  await requireUser("JUDGE");
  const awards = await getAwards();

  return (
    <div>
      <PageHeader
        kicker="Results"
        title="Awards"
        description="Winners are calculated from submitted scores. A team needs a final repository submission and at least one submitted score. Placements break ties by earlier submission, then team number."
      />
      <ol className="divide-y divide-border border-b border-border">
        {awards.rows.map((award) => (
          <li key={award.type} className="grid gap-3 border-b border-border py-5 md:grid-cols-[14rem_minmax(0,1fr)_auto] md:items-start md:gap-8">
            <div>
              <p className="font-semibold">{award.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{award.rule}</p>
            </div>
            {award.team ? (
              <div>
                <p className="font-semibold">{award.team}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {award.projectTitle} · {award.track}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No eligible project yet.</p>
            )}
            {award.team ? (
              <Badge variant="accent">{award.criterion ? `${award.score?.toFixed(2)} / 10` : `${award.score?.toFixed(2)} / 100`}</Badge>
            ) : (
              <Badge>Open</Badge>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
