import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { entrySteps, StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";
import { getSettings } from "@/server/settings";

export default async function ParticipantDashboard() {
  const user = await requireUser("PARTICIPANT");
  const settings = await getSettings();
  const team = await prisma.team.findUnique({
    where: { ownerId: user.id },
    include: { members: { orderBy: { isCaptain: "desc" } }, project: { include: { track: true, submission: true } } },
  });
  const steps = entrySteps({
    team: Boolean(team),
    idea: Boolean(team?.project),
    submission: Boolean(team?.project?.submission),
  });
  const nextDeadline = team ? settings.submissionDeadline : settings.registrationDeadline;
  const nextLabel = team ? "Submission closes" : "Registration closes";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your hackathon</h1>
          <p className="mt-1 text-muted-foreground">{settings.name} · {settings.eventLabel}</p>
        </div>
        <Button asChild>
          <Link href={team?.project?.submission ? "/participant/submission" : team?.project ? "/participant/submission" : team ? "/participant/idea" : "/participant/team"}>
            {team?.project?.submission ? "Review submission" : team?.project ? "Add repository" : team ? "Submit idea" : "Register team"}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Completion</CardTitle>
            <CardDescription>Team, idea, then the GitHub repository.</CardDescription>
          </CardHeader>
          <CardContent>
            <StepProgress steps={steps} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Countdown deadline={nextDeadline.toISOString()} label={nextLabel} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Info label="Team" value={team?.name ?? "Not registered"} />
        <Info label="Track" value={team?.project?.track.name ?? "Not chosen"} />
        <Info label="Project" value={team?.project?.title ?? "No idea yet"} />
        <Info label="Registered" value={team ? formatWhen(team.createdAt) : "—"} />
        <Info label="Idea status" value={team?.project ? "Submitted" : "Not submitted"} />
        <Info label="GitHub status" value={team?.project?.submission ? "Submitted" : "Not submitted"} />
        <Info label="Members" value={team ? String(team.members.length) : "0"} />
        <Info label="Venue" value={settings.venue} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>Student details stay with the team. Rankings are not shown in this portal.</CardDescription>
        </CardHeader>
        <CardContent>
          {team ? (
            <ul className="grid gap-3">
              {team.members.map((member) => (
                <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary px-3 py-3 text-sm">
                  <span className="font-semibold">{member.fullName}{member.isCaptain ? " · Captain" : ""}</span>
                  <span className="text-muted-foreground">{member.studentId} · {member.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Register a team to see members here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
