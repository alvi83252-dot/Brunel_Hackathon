import Link from "next/link";
import { IdeaForm } from "@/components/idea-form";
import { entrySteps, StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";
import { getSettings, isBefore } from "@/server/settings";

export default async function IdeaPage() {
  const user = await requireUser("PARTICIPANT");
  const settings = await getSettings();
  const team = await prisma.team.findUnique({
    where: { ownerId: user.id },
    include: { project: { include: { submission: { select: { id: true } } } } },
  });
  const steps = entrySteps({ team: Boolean(team), idea: Boolean(team?.project), submission: Boolean(team?.project?.submission) });
  const tracks = await prisma.track.findMany({ orderBy: { name: "asc" } });
  const open = isBefore(settings.submissionDeadline);

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Register a team first</CardTitle>
          <CardDescription>An idea belongs to a team, so the roster needs to exist before this step.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <StepProgress steps={steps} />
          <Button asChild>
            <Link href="/participant/team">Go to team registration</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const project = team.project;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project ? "Edit the idea" : "Submit the idea"}</CardTitle>
        <CardDescription>
          {open ? `Ideas can be edited until the deadline, which is ${formatWhen(settings.submissionDeadline)}.` : "The submission deadline has passed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <StepProgress steps={steps} />
        <IdeaForm
          locked={!open}
          projectId={project?.id}
          tracks={tracks}
          initial={{
            trackId: project?.trackId ?? "",
            title: project?.title ?? "",
            shortDescription: project?.shortDescription ?? "",
            problemStatement: project?.problemStatement ?? "",
            proposedSolution: project?.proposedSolution ?? "",
            expectedImpact: project?.expectedImpact ?? "",
          }}
        />
      </CardContent>
    </Card>
  );
}
