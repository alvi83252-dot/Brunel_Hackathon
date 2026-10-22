import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreForm, type ReviewDraft } from "@/components/score-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4">
        <div>
          <Link className="text-sm font-semibold underline" href="/judge/projects">
            All projects
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="accent">{project.track}</Badge>
            <Badge variant={project.submissionStatus === "Final submitted" ? "success" : "warning"}>{project.submissionStatus}</Badge>
            {blindJudging ? <Badge>Blind</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold">{project.title}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{project.team}</p>
        </div>
        {blindJudging ? (
          <p className="rounded-2xl bg-secondary p-4 text-sm">Team name, student names, student IDs, and emails are hidden for this review.</p>
        ) : null}
        <Section title="Description" body={project.shortDescription} />
        <Section title="Problem statement" body={project.problemStatement} />
        <Section title="Proposed solution" body={project.proposedSolution} />
        <Section title="Expected impact" body={project.expectedImpact} />
        <Card>
          <CardHeader>
            <CardTitle>Links and dates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <LinkRow label="GitHub" href={project.githubUrl} />
            <LinkRow label="Demo" href={project.demoUrl} />
            <LinkRow label="Documentation" href={project.docsUrl} />
            <p><span className="font-semibold">Team registered.</span> {formatWhen(project.registeredAt)}</p>
            <p><span className="font-semibold">Final submission.</span> {formatWhen(project.submittedAt)}</p>
            {project.notes ? <p className="whitespace-pre-wrap"><span className="font-semibold">Notes.</span> {project.notes}</p> : null}
          </CardContent>
        </Card>
        {project.members.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {project.members.map((member) => (
                <p key={member.email}>
                  {member.fullName}
                  {member.isCaptain ? " · Captain" : ""} · {member.studentId} · {member.email}
                </p>
              ))}
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Submitted judge scores</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {project.judges.length === 0 ? <p className="text-muted-foreground">No judge has submitted a score yet.</p> : null}
            {project.judges.map((judge) => (
              <p key={judge.label} className="flex justify-between gap-3">
                <span>{judge.label}</span>
                <span className="font-bold tabular-nums">{judge.score?.toFixed(2)}</span>
              </p>
            ))}
            <p className="border-t border-border pt-2 font-semibold">Average {project.averageScore == null ? "—" : project.averageScore.toFixed(2)} from {project.judgeCount} judge{project.judgeCount === 1 ? "" : "s"}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="h-fit lg:sticky lg:top-4">
        <CardHeader>
          <CardTitle>Score this project</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreForm projectId={project.id} open={judgingOpen} initial={project.review as ReviewDraft | null} />
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-6">{body}</p>
      </CardContent>
    </Card>
  );
}

function LinkRow({ label, href }: { label: string; href: string | null }) {
  return (
    <p>
      <span className="font-semibold">{label}.</span>{" "}
      {href ? (
        <a className="underline" href={href} target="_blank" rel="noreferrer">
          {href}
        </a>
      ) : (
        "Not provided"
      )}
    </p>
  );
}
