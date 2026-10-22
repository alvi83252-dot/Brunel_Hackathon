import { entrySteps, StepProgress } from "@/components/step-progress";
import { TeamForm } from "@/components/team-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";
import { getSettings, isBefore } from "@/server/settings";

export default async function TeamPage() {
  const user = await requireUser("PARTICIPANT");
  const settings = await getSettings();
  const team = await prisma.team.findUnique({
    where: { ownerId: user.id },
    include: {
      members: { orderBy: { isCaptain: "desc" } },
      project: { select: { submission: { select: { id: true } } } },
    },
  });
  const open = isBefore(settings.registrationDeadline);
  const members = team?.members ?? [];
  const captain = members.find((member) => member.isCaptain) ?? members[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{team ? "Update your team" : "Register your team"}</CardTitle>
        <CardDescription>
          {open ? `The registration deadline is ${formatWhen(settings.registrationDeadline)}.` : "Registration is closed, so this team can no longer be edited."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <StepProgress steps={entrySteps({ team: Boolean(team), idea: Boolean(team?.project), submission: Boolean(team?.project?.submission) })} />
        <TeamForm
          teamId={team?.id}
          locked={!open}
          captain={{ fullName: captain?.fullName || user.name, studentId: user.studentId ?? "", email: user.email }}
          initialName={team?.name ?? ""}
          initialMembers={
            members.length
              ? members.map((member) => ({ fullName: member.fullName, studentId: member.studentId, email: member.email }))
              : [
                  { fullName: user.name, studentId: user.studentId ?? "", email: user.email },
                  { fullName: "", studentId: "", email: "" },
                ]
          }
        />
      </CardContent>
    </Card>
  );
}
