import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { MetricStrip, PageHeader } from "@/components/page-header";
import { entrySteps, StepProgress } from "@/components/step-progress";
import { Button } from "@/components/ui/button";
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
  const nextHref = team?.project?.submission ? "/participant/submission" : team?.project ? "/participant/submission" : team ? "/participant/idea" : "/participant/team";
  const nextLabelAction = team?.project?.submission ? "Review submission" : team?.project ? "Add repository" : team ? "Submit idea" : "Register team";

  return (
    <div>
      <PageHeader
        kicker="Participant"
        title="Your hackathon"
        description={`${settings.name} · ${settings.eventLabel}`}
        action={
          <Button asChild>
            <Link href={nextHref}>{nextLabelAction}</Link>
          </Button>
        }
      />

      <MetricStrip
        items={[
          { label: "Team", value: team?.name ?? "Not registered" },
          { label: "Track", value: team?.project?.track.name ?? "Not chosen" },
          { label: "Project", value: team?.project?.title ?? "No idea yet" },
          { label: "Registered", value: team ? formatWhen(team.createdAt) : "—" },
          { label: "Idea", value: team?.project ? "Submitted" : "Not submitted" },
          { label: "GitHub", value: team?.project?.submission ? "Submitted" : "Not submitted" },
          { label: "Members", value: team ? String(team.members.length) : "0" },
          { label: "Venue", value: settings.venue },
        ]}
      />

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <div className="panel px-5 py-5 sm:px-6">
          <h2 className="text-sm font-semibold">Entry</h2>
          <p className="mt-1 text-sm text-muted-foreground">Team, idea, then the GitHub repository.</p>
          <div className="mt-4">
            <StepProgress steps={steps} />
          </div>
        </div>
        <div className="panel px-5 py-5 sm:px-6">
          <Countdown deadline={nextDeadline.toISOString()} label={nextLabel} />
        </div>
      </section>

      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold">Team members</h2>
          <p className="mt-1 text-sm text-muted-foreground">Student details stay with the team. Rankings are not shown in this portal.</p>
        </div>
        {team ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Student ID</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-semibold">{member.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.isCaptain ? "Captain" : "Member"}</td>
                    <td className="px-4 py-3 tabular-nums">{member.studentId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-muted-foreground sm:px-6">Register a team to see members here.</p>
        )}
      </section>
    </div>
  );
}
