import Link from "next/link";
import { entrySteps, StepProgress } from "@/components/step-progress";
import { SubmissionForm } from "@/components/submission-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";
import { getSettings, isBefore } from "@/server/settings";

export default async function SubmissionPage() {
  const user = await requireUser("PARTICIPANT");
  const settings = await getSettings();
  const team = await prisma.team.findUnique({
    where: { ownerId: user.id },
    include: { project: { include: { submission: true } } },
  });

  const steps = entrySteps({
    team: Boolean(team),
    idea: Boolean(team?.project),
    submission: Boolean(team?.project?.submission),
  });

  if (!team?.project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit an idea first</CardTitle>
          <CardDescription>The repository is attached to a project, so the idea form comes before this one.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <StepProgress steps={steps} />
          <Button asChild>
            <Link href={team ? "/participant/idea" : "/participant/team"}>{team ? "Submit the idea" : "Register a team"}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const open = isBefore(settings.submissionDeadline);
  const submission = team.project.submission;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Final submission</CardTitle>
        <CardDescription>
          {open ? `Repository links can be updated until the deadline, which is ${formatWhen(settings.submissionDeadline)}.` : "The submission deadline has passed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <StepProgress steps={steps} />
        <SubmissionForm
          locked={!open}
          submissionId={submission?.id}
          submittedAt={submission ? formatWhen(submission.submittedAt) : null}
          initial={{
            githubUrl: submission?.githubUrl ?? "",
            demoUrl: submission?.demoUrl ?? "",
            docsUrl: submission?.docsUrl ?? "",
            notes: submission?.notes ?? "",
          }}
        />
      </CardContent>
    </Card>
  );
}
