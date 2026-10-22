import { prisma } from "@/lib/prisma";
import { teamCode } from "@/lib/utils";
import { AWARD_DEFINITIONS } from "@/lib/awards";
import { getSettings } from "@/server/settings";

function teamLabel(name: string, displayNumber: number, blind: boolean) {
  return blind ? teamCode(displayNumber) : name;
}

export async function getLeaderboard(trackSlug?: string) {
  const settings = await getSettings();
  const entries = await prisma.leaderboardEntry.findMany({
    include: {
      project: { include: { team: true, track: true, submission: true } },
    },
  });

  const rows = entries
    .filter((entry) => (trackSlug ? entry.project.track.slug === trackSlug : true))
    .map((entry) => ({
      projectId: entry.projectId,
      rank: entry.rank,
      trackRank: entry.trackRank,
      team: teamLabel(entry.project.team.name, entry.project.team.displayNumber, settings.blindJudging),
      track: entry.project.track.name,
      trackSlug: entry.project.track.slug,
      averageScore: entry.judgeCount > 0 ? entry.averageScore : null,
      judgeCount: entry.judgeCount,
      submissionStatus: entry.project.submission ? "Final submitted" : "Idea only",
    }))
    .sort((left, right) => {
      if (left.rank === 0 && right.rank === 0) return left.team.localeCompare(right.team);
      if (left.rank === 0) return 1;
      if (right.rank === 0) return -1;
      return trackSlug ? left.trackRank - right.trackRank : left.rank - right.rank;
    });

  return { blindJudging: settings.blindJudging, rows };
}

export async function getAwards() {
  const settings = await getSettings();
  const awards = await prisma.award.findMany({
    include: { project: { include: { team: true, track: true } } },
  });
  const rows = AWARD_DEFINITIONS.map((definition) => {
    const award = awards.find((item) => item.type === definition.type);
    const project = award?.project;
    return {
      type: definition.type,
      title: definition.title,
      rule: definition.rule,
      score: award?.score ?? null,
      criterion: "criterion" in definition,
      team: project ? teamLabel(project.team.name, project.team.displayNumber, settings.blindJudging) : null,
      projectTitle: project?.title ?? null,
      track: project?.track.name ?? null,
    };
  });
  return { blindJudging: settings.blindJudging, rows };
}

export async function getJudgeCatalog(judgeId: string) {
  const settings = await getSettings();
  const projects = await prisma.project.findMany({
    include: {
      team: true,
      track: true,
      submission: true,
      scores: { where: { judgeId }, include: { comments: true } },
      leaderboard: true,
    },
    orderBy: { team: { displayNumber: "asc" } },
  });

  return {
    blindJudging: settings.blindJudging,
    judgingOpen: settings.judgingDeadline.getTime() >= Date.now(),
    judgingDeadline: settings.judgingDeadline.toISOString(),
    projects: projects.map((project) => {
      const mine = project.scores[0] ?? null;
      const notes = Object.fromEntries((mine?.comments ?? []).map((comment) => [comment.criterion, comment.body]));
      return {
        id: project.id,
        team: teamLabel(project.team.name, project.team.displayNumber, settings.blindJudging),
        track: project.track.name,
        trackSlug: project.track.slug,
        title: project.title,
        shortDescription: project.shortDescription,
        submissionStatus: project.submission ? "Final submitted" : "Idea only",
        averageScore: project.leaderboard && project.leaderboard.judgeCount > 0 ? project.leaderboard.averageScore : null,
        judgeCount: project.leaderboard?.judgeCount ?? 0,
        rank: project.leaderboard?.rank ?? 0,
        myScore: mine?.status === "SUBMITTED" ? mine.weightedScore : null,
        myStatus: mine?.status ?? "UNSCORED",
        review: mine
          ? {
              technical: mine.technical,
              innovation: mine.innovation,
              impact: mine.impact,
              solution: mine.solution,
              sponsor: mine.sponsor,
              business: mine.business,
              presentation: mine.presentation,
              technicalNote: notes.technical ?? "",
              innovationNote: notes.innovation ?? "",
              impactNote: notes.impact ?? "",
              solutionNote: notes.solution ?? "",
              sponsorNote: notes.sponsor ?? "",
              businessNote: notes.business ?? "",
              presentationNote: notes.presentation ?? "",
              overallFeedback: notes.overall ?? "",
              recommendation: mine.recommendation,
              status: mine.status,
              weightedScore: mine.weightedScore,
              updatedAt: mine.updatedAt.toISOString(),
            }
          : null,
      };
    }),
  };
}

export async function getJudgeProject(judgeId: string, projectId: string) {
  const settings = await getSettings();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: { include: { members: { orderBy: { isCaptain: "desc" } } } },
      track: true,
      submission: true,
      scores: { include: { judge: true, comments: true } },
      leaderboard: true,
    },
  });
  if (!project) return null;

  const blind = settings.blindJudging;
  const mine = project.scores.find((score) => score.judgeId === judgeId) ?? null;
  const notes = Object.fromEntries((mine?.comments ?? []).map((comment) => [comment.criterion, comment.body]));
  const submitted = project.scores.filter((score) => score.status === "SUBMITTED" && score.weightedScore != null);

  return {
    blindJudging: blind,
    judgingOpen: settings.judgingDeadline.getTime() >= Date.now(),
    judgingDeadline: settings.judgingDeadline.toISOString(),
    project: {
      id: project.id,
      team: teamLabel(project.team.name, project.team.displayNumber, blind),
      track: project.track.name,
      title: project.title,
      shortDescription: project.shortDescription,
      problemStatement: project.problemStatement,
      proposedSolution: project.proposedSolution,
      expectedImpact: project.expectedImpact,
      members: blind
        ? []
        : project.team.members.map((member) => ({
            fullName: member.fullName,
            studentId: member.studentId,
            email: member.email,
            isCaptain: member.isCaptain,
          })),
      githubUrl: project.submission?.githubUrl ?? null,
      demoUrl: project.submission?.demoUrl ?? null,
      docsUrl: project.submission?.docsUrl ?? null,
      notes: project.submission?.notes ?? null,
      submittedAt: project.submission?.submittedAt.toISOString() ?? null,
      registeredAt: project.team.createdAt.toISOString(),
      submissionStatus: project.submission ? "Final submitted" : "Idea only",
      averageScore: submitted.length
        ? Math.round((submitted.reduce((sum, score) => sum + (score.weightedScore ?? 0), 0) / submitted.length) * 100) / 100
        : null,
      judgeCount: submitted.length,
      judges: blind
        ? submitted.map((score, index) => ({ label: `Judge ${index + 1}`, score: score.weightedScore }))
        : submitted.map((score) => ({ label: score.judge.name, score: score.weightedScore })),
      review: mine
        ? {
            technical: mine.technical,
            innovation: mine.innovation,
            impact: mine.impact,
            solution: mine.solution,
            sponsor: mine.sponsor,
            business: mine.business,
            presentation: mine.presentation,
            technicalNote: notes.technical ?? "",
            innovationNote: notes.innovation ?? "",
            impactNote: notes.impact ?? "",
            solutionNote: notes.solution ?? "",
            sponsorNote: notes.sponsor ?? "",
            businessNote: notes.business ?? "",
            presentationNote: notes.presentation ?? "",
            overallFeedback: notes.overall ?? "",
            recommendation: mine.recommendation,
            status: mine.status,
            weightedScore: mine.weightedScore,
            updatedAt: mine.updatedAt.toISOString(),
          }
        : null,
    },
  };
}
