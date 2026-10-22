import { finalSubmissionEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { canonicalGithubRepo, fieldErrorsFromZod, submissionSchema } from "@/lib/validators";
import { AppError } from "@/server/errors";
import { deliverEmail } from "@/server/mailer";
import { getSettings, isBefore } from "@/server/settings";
import { recomputeStandings } from "@/server/standings";

export async function saveSubmission(userId: string, input: unknown) {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Check the highlighted fields.", 400, fieldErrorsFromZod(parsed.error));

  const githubUrl = canonicalGithubRepo(parsed.data.githubUrl);
  if (!githubUrl) {
    throw new AppError("Enter a GitHub repository URL such as https://github.com/team/project.", 400, {
      githubUrl: "Enter a GitHub repository URL such as https://github.com/team/project.",
    });
  }

  const settings = await getSettings();
  if (!isBefore(settings.submissionDeadline)) throw new AppError("Final submissions are closed.", 403);

  const team = await prisma.team.findUnique({
    where: { ownerId: userId },
    include: { members: true, project: { include: { submission: true } } },
  });
  if (!team?.project) throw new AppError("Submit your idea before the GitHub repository.", 409);

  const data = {
    githubUrl,
    demoUrl: parsed.data.demoUrl || null,
    docsUrl: parsed.data.docsUrl || null,
    notes: parsed.data.notes || null,
  };

  const submission = team.project.submission
    ? await prisma.submission.update({ where: { id: team.project.submission.id }, data })
    : await prisma.submission.create({
        data: { ...data, projectId: team.project.id, submittedAt: new Date() },
      });

  await recomputeStandings();
  const message = finalSubmissionEmail({
    teamName: team.name,
    title: team.project.title,
    githubUrl: submission.githubUrl,
    when: formatWhen(submission.submittedAt),
  });
  await deliverEmail({
    userId,
    teamId: team.id,
    type: "FINAL_SUBMISSION",
    to: team.members.map((member) => member.email),
    ...message,
  });
  return submission;
}
