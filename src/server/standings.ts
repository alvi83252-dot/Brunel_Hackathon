import type { Prisma } from "@prisma/client";
import { AWARD_DEFINITIONS } from "@/lib/awards";
import { CRITERIA, type CriterionKey, average } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";

type Db = Prisma.TransactionClient;

type StandingRow = {
  projectId: string;
  trackSlug: string;
  eligible: boolean;
  averageScore: number;
  judgeCount: number;
  submittedAt: Date | null;
  displayNumber: number;
  criteria: Record<CriterionKey, number | null>;
  rank: number;
  trackRank: number;
};

function byWeighted(left: StandingRow, right: StandingRow) {
  if (right.averageScore !== left.averageScore) return right.averageScore - left.averageScore;
  const leftTime = left.submittedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const rightTime = right.submittedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (leftTime !== rightTime) return leftTime - rightTime;
  return left.displayNumber - right.displayNumber;
}

function bestCriterion(rows: StandingRow[], key: CriterionKey) {
  return rows
    .filter((row) => row.eligible && row.criteria[key] != null)
    .sort((left, right) => {
      const diff = (right.criteria[key] ?? 0) - (left.criteria[key] ?? 0);
      return diff === 0 ? byWeighted(left, right) : diff;
    })[0];
}

export async function recomputeStandings(tx: Db = prisma) {
  const projects = await tx.project.findMany({
    include: {
      team: true,
      track: true,
      submission: true,
      scores: { where: { status: "SUBMITTED", weightedScore: { not: null } } },
    },
  });

  const rows: StandingRow[] = projects.map((project) => {
    const criteria = Object.fromEntries(
      CRITERIA.map((criterion) => [criterion.key, average(project.scores.map((score) => score[criterion.key] as number))]),
    ) as Record<CriterionKey, number | null>;
    const judgeCount = project.scores.length;
    const scored = project.scores.map((score) => score.weightedScore).filter((value): value is number => value != null);
    return {
      projectId: project.id,
      trackSlug: project.track.slug,
      judgeCount,
      averageScore: average(scored) ?? 0,
      submittedAt: project.submission?.submittedAt ?? null,
      displayNumber: project.team.displayNumber,
      criteria,
      eligible: Boolean(project.submission) && judgeCount > 0,
      rank: 0,
      trackRank: 0,
    };
  });

  const ranked = rows.filter((row) => row.judgeCount > 0).sort(byWeighted);
  ranked.forEach((row, index) => {
    row.rank = index + 1;
  });

  for (const slug of new Set(rows.map((row) => row.trackSlug))) {
    rows
      .filter((row) => row.trackSlug === slug && row.judgeCount > 0)
      .sort(byWeighted)
      .forEach((row, index) => {
        row.trackRank = index + 1;
      });
  }

  await tx.leaderboardEntry.deleteMany();
  if (rows.length > 0) {
    await tx.leaderboardEntry.createMany({
      data: rows.map((row) => ({
        projectId: row.projectId,
        rank: row.rank,
        trackRank: row.trackRank,
        averageScore: row.averageScore,
        judgeCount: row.judgeCount,
      })),
    });
  }

  const eligible = rows.filter((row) => row.eligible).sort(byWeighted);
  for (const award of AWARD_DEFINITIONS) {
    let winner: StandingRow | undefined;
    if (award.type === "OVERALL_WINNER") winner = eligible[0];
    else if (award.type === "RUNNER_UP") winner = eligible[1];
    else if (award.type === "SECOND_RUNNER_UP") winner = eligible[2];
    else if ("trackSlug" in award) winner = eligible.filter((row) => row.trackSlug === award.trackSlug).sort(byWeighted)[0];
    else if ("criterion" in award) winner = bestCriterion(rows, award.criterion);
    else winner = undefined;

    const score =
      winner == null
        ? null
        : "criterion" in award
          ? winner.criteria[award.criterion]
          : winner.averageScore;

    await tx.award.upsert({
      where: { type: award.type },
      create: {
        type: award.type,
        label: award.title,
        detail: award.rule,
        projectId: winner?.projectId ?? null,
        score,
      },
      update: {
        label: award.title,
        detail: award.rule,
        projectId: winner?.projectId ?? null,
        score,
      },
    });
  }
}
