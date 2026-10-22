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
    <div className="grid gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">{doneCount === steps.length ? "Entry complete" : `Step ${onStep} of ${steps.length}`}</p>
        <p className="text-sm tabular-nums text-muted-foreground">{percent}%</p>
      </div>
      <Progress value={percent} label={`${doneCount} of ${steps.length} steps complete`} />
      <ol className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
        {steps.map((step, index) => {
          const current = index === currentIndex;
          return (
            <li key={step.href} className="bg-card">
              <Link
                href={step.href}
                aria-current={current ? "step" : undefined}
                className="flex min-h-12 items-center gap-3 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center border text-xs tabular-nums ${step.done || current ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                  {index + 1}
                </span>
                <span className={step.done || current ? "font-semibold" : "text-muted-foreground"}>{step.label}</span>
                {step.done ? <span className="ml-auto text-xs text-muted-foreground">Done</span> : current ? <span className="ml-auto text-xs text-accent">Now</span> : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
