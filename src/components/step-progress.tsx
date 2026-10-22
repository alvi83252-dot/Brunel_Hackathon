import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export type ProgressStep = {
  label: string;
  href: string;
  done: boolean;
};

export function entrySteps(flags: { team: boolean; idea: boolean; submission: boolean }): ProgressStep[] {
  return [
    { label: "Team", href: "/participant/team", done: flags.team },
    { label: "Idea", href: "/participant/idea", done: flags.idea },
    { label: "Repository", href: "/participant/submission", done: flags.submission },
  ];
}

export function StepProgress({ steps }: { steps: ProgressStep[] }) {
  const doneCount = steps.filter((step) => step.done).length;
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;
  const currentIndex = steps.findIndex((step) => !step.done);
  const onStep = currentIndex === -1 ? steps.length : currentIndex + 1;

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">{doneCount === steps.length ? "Entry complete" : `Step ${onStep} of ${steps.length}`}</p>
        <p className="text-sm tabular-nums text-muted-foreground">{percent}%</p>
      </div>
      <Progress value={percent} label={`${doneCount} of ${steps.length} steps complete`} />
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const current = index === currentIndex;
          return (
            <li key={step.href}>
              <Link
                href={step.href}
                aria-current={current ? "step" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  step.done
                    ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100"
                    : current
                      ? "bg-accent/15 text-foreground"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                <span className="tabular-nums">{index + 1}</span>
                <span>{step.label}</span>
                {step.done ? <span className="ml-auto text-xs">Done</span> : current ? <span className="ml-auto text-xs">Now</span> : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
