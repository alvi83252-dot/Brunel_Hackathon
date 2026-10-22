import { BlindToggle } from "@/components/blind-toggle";
import { PageHeader } from "@/components/page-header";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";
import { getSettings } from "@/server/settings";

export default async function SettingsPage() {
  await requireUser("JUDGE");
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        kicker="Settings"
        title="Blind judging"
        description="Turn this on before reviews begin. It applies to every judge, including the project list, the review page, the leaderboard, and the awards."
      />
      <BlindToggle enabled={settings.blindJudging} />
      <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
        <div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">Registration deadline</dt><dd className="font-semibold">{formatWhen(settings.registrationDeadline)}</dd></div>
        <div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">Submission deadline</dt><dd className="font-semibold">{formatWhen(settings.submissionDeadline)}</dd></div>
        <div className="flex justify-between gap-3 py-3"><dt className="text-muted-foreground">Judging deadline</dt><dd className="font-semibold">{formatWhen(settings.judgingDeadline)}</dd></div>
      </dl>
    </div>
  );
}
