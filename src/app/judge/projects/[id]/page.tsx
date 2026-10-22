import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreForm, type ReviewDraft } from "@/components/score-form";
import { Badge } from "@/components/ui/badge";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";
import { getJudgeProject } from "@/server/read";

export default async function ProjectReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("JUDGE");
  const { id } = await params;
  const result = await getJudgeProject(user.id, id);
  if (!result) notFound();
  const { project, blindJudging, judgingOpen } = result;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
      <article>
        <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground" href="/judge/projects">
          All projects
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="accent">{project.track}</Badge>
          <Badge variant={project.submissionStatus === "Final submitted" ? "success" : "warning"}>{project.submissionStatus}</Badge>
          {blindJudging ? <Badge>Blind</Badge> : null}
        </div>
        <h1 className="mt-3 text-4xl">{project.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{project.team}</p>
        {blindJudging ? (
          <p className="mt-4 border border-border bg-secondary px-4 py-3 text-sm">Team name, student names, student IDs, and emails are hidden for this review.</p>
        ) : null}
        <div className="mt-8 divide-y divide-border border-y border-border">
          <Section title="Description" body={project.shortDescription} />
          <Section title="Problem statement" body={project.problemStatement} />
          <Section title="Proposed solution" body={project.proposedSolution} />
          <Section title="Expected impact" body={project.expectedImpact} />
        </div>
        <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
          <LinkRow
            label="GitHub"
            href={project.githubUrl}
            note={blindJudging && project.githubUrl ? "The repository link stays available so you can review the code. A GitHub username can still identify the team." : undefined}
          />
          <LinkRow label="Demo" href={project.demoUrl} />
          <LinkRow label="Documentation" href={project.docsUrl} />
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
            <dt className="text-muted-foreground">Team registered</dt>
            <dd>{formatWhen(project.registeredAt)}</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
            <dt className="text-muted-foreground">Final submission</dt>
            <dd>{formatWhen(project.submittedAt)}</dd>
          </div>
        </dl>
        {project.notes ? (
          <section className="mt-8">
            <h2 className="kicker">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{project.notes}</p>
          </section>
        ) : null}
        {project.members.length > 0 ? (
          <section className="mt-8">
            <h2 className="kicker">Team</h2>
            <ul className="mt-3 divide-y divide-border border-y border-border text-sm">
              {project.members.map((member) => (
                <li key={member.email} className="py-3">
                  <span className="font-semibold">{member.fullName}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {member.isCaptain ? "Captain" : "Member"} · {member.studentId} · {member.email}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="mt-8">
          <h2 className="kicker">Submitted scores</h2>
          <ul className="mt-3 divide-y divide-border border-y border-border text-sm">
            {project.judges.length === 0 ? <li className="py-3 text-muted-foreground">No judge has submitted a score yet.</li> : null}
            {project.judges.map((judge) => (
              <li key={judge.label} className="flex justify-between gap-3 py-3">
                <span>{judge.label}</span>
                <span className="font-semibold tabular-nums">{judge.score?.toFixed(2)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3 py-3 font-semibold">
              <span>Average</span>
              <span className="tabular-nums">
                {project.averageScore == null ? "—" : project.averageScore.toFixed(2)} · {project.judgeCount} judge{project.judgeCount === 1 ? "" : "s"}
              </span>
            </li>
          </ul>
        </section>
      </article>
      <aside className="border border-border bg-card p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-semibold">Score this project</h2>
        <div className="mt-4">
          <ScoreForm projectId={project.id} open={judgingOpen} initial={project.review as ReviewDraft | null} />
        </div>
      </aside>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="py-5">
      <h2 className="kicker">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{body}</p>
    </section>
  );
}

function LinkRow({ label, href, note }: { label: string; href: string | null; note?: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all">
        {href ? (
          <a className="underline decoration-border underline-offset-4 hover:decoration-foreground" href={href} target="_blank" rel="noopener noreferrer">
            {href}
          </a>
        ) : (
          "Not provided"
        )}
        {note ? <p className="mt-1 text-muted-foreground">{note}</p> : null}
      </dd>
    </div>
  );
}
