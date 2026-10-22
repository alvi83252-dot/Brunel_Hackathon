import { BlindToggle } from "@/components/blind-toggle";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";
import { getSettings } from "@/server/settings";

export default async function SettingsPage() {
  await requireUser("JUDGE");
  const settings = await getSettings();

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Blind judging</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Turn this on before reviews begin. It applies to every judge, including the project list, the review page, the leaderboard, and the awards.
        </p>
      </div>
      <BlindToggle enabled={settings.blindJudging} />
      <dl className="grid gap-2 rounded-2xl border border-border bg-card p-5 text-sm">
        <div className="flex justify-between gap-3"><dt>Registration deadline</dt><dd>{formatWhen(settings.registrationDeadline)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Submission deadline</dt><dd>{formatWhen(settings.submissionDeadline)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Judging deadline</dt><dd>{formatWhen(settings.judgingDeadline)}</dd></div>
      </dl>
    </div>
  );
}
