import { ideaSubmissionEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { fieldErrorsFromZod, ideaSchema } from "@/lib/validators";
import { AppError } from "@/server/errors";
import { deliverEmail } from "@/server/mailer";
import { getSettings, isBefore } from "@/server/settings";
import { recomputeStandings } from "@/server/standings";

export async function saveIdea(userId: string, input: unknown) {
  const parsed = ideaSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Check the highlighted fields.", 400, fieldErrorsFromZod(parsed.error));

  const settings = await getSettings();
  if (!isBefore(settings.submissionDeadline)) throw new AppError("Idea submissions are closed.", 403);

  const team = await prisma.team.findUnique({
    where: { ownerId: userId },
    include: { members: true, project: true },
  });
  if (!team) throw new AppError("Register a team before submitting an idea.", 409);

  const track = await prisma.track.findUnique({ where: { id: parsed.data.trackId } });
  if (!track) throw new AppError("Choose a valid track.", 400, { trackId: "Choose a valid track." });

  const project = team.project
    ? await prisma.project.update({
        where: { id: team.project.id },
        data: { ...parsed.data },
        include: { track: true, team: { include: { members: true } } },
      })
    : await prisma.project.create({
        data: { teamId: team.id, ...parsed.data },
        include: { track: true, team: { include: { members: true } } },
      });

  await recomputeStandings();
  const message = ideaSubmissionEmail({
    teamName: team.name,
    title: project.title,
    track: project.track.name,
    when: formatWhen(project.updatedAt),
  });
  await deliverEmail({
    userId,
    teamId: team.id,
    type: "IDEA_SUBMISSION",
    to: project.team.members.map((member) => member.email),
    ...message,
  });
  return project;
}
