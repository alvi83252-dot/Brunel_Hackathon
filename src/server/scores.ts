import { CRITERIA, weightedScore } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";
import { fieldErrorsFromZod, scoreSchema } from "@/lib/validators";
import { AppError } from "@/server/errors";
import { getSettings, isBefore } from "@/server/settings";
import { recomputeStandings } from "@/server/standings";

export async function saveScore(judgeId: string, input: unknown) {
  const parsed = scoreSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Check the highlighted fields.", 400, fieldErrorsFromZod(parsed.error));

  const settings = await getSettings();
  if (!isBefore(settings.judgingDeadline)) throw new AppError("Judging is closed.", 403);

  const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
  if (!project) throw new AppError("That project could not be found.", 404);

  const data = parsed.data;
  const existing = await prisma.judgeScore.findUnique({
    where: { projectId_judgeId: { projectId: project.id, judgeId } },
  });
  if (existing?.status === "SUBMITTED" && data.status === "DRAFT") {
    return { score: existing, weightedScore: existing.weightedScore };
  }
  const scoreValue = weightedScore({
    technical: data.technical,
    innovation: data.innovation,
    impact: data.impact,
    solution: data.solution,
    sponsor: data.sponsor,
    business: data.business,
    presentation: data.presentation,
  });

  const comments = [
    ...CRITERIA.map((criterion) => ({
      criterion: criterion.key,
      body: data[`${criterion.key}Note`],
    })),
    { criterion: "overall", body: data.overallFeedback },
  ].filter((comment) => comment.body);

  const score = await prisma.$transaction(async (tx) => {
    const saved = await tx.judgeScore.upsert({
      where: { projectId_judgeId: { projectId: project.id, judgeId } },
      create: {
        projectId: project.id,
        judgeId,
        technical: data.technical,
        innovation: data.innovation,
        impact: data.impact,
        solution: data.solution,
        sponsor: data.sponsor,
        business: data.business,
        presentation: data.presentation,
        recommendation: data.recommendation,
        status: data.status,
        weightedScore: scoreValue,
      },
      update: {
        technical: data.technical,
        innovation: data.innovation,
        impact: data.impact,
        solution: data.solution,
        sponsor: data.sponsor,
        business: data.business,
        presentation: data.presentation,
        recommendation: data.recommendation,
        status: data.status,
        weightedScore: scoreValue,
      },
    });
    await tx.judgeComment.deleteMany({ where: { scoreId: saved.id } });
    if (comments.length > 0) {
      await tx.judgeComment.createMany({
        data: comments.map((comment) => ({ scoreId: saved.id, criterion: comment.criterion, body: comment.body })),
      });
    }
    await recomputeStandings(tx);
    return tx.judgeScore.findUnique({ where: { id: saved.id }, include: { comments: true } });
  });

  return { score, weightedScore: scoreValue };
}
