import { Prisma } from "@prisma/client";
import { teamRegistrationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { fieldErrorsFromZod, teamSchema } from "@/lib/validators";
import { AppError } from "@/server/errors";
import { deliverEmail } from "@/server/mailer";
import { getSettings, isBefore } from "@/server/settings";

const teamInclude = { members: { orderBy: { isCaptain: "desc" as const } } };

export async function getOwnedTeam(userId: string) {
  return prisma.team.findUnique({ where: { ownerId: userId }, include: teamInclude });
}

export async function saveTeam(userId: string, input: unknown, teamId?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PARTICIPANT" || !user.studentId) {
    throw new AppError("Only participants can register a team.", 403);
  }

  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Check the highlighted fields.", 400, fieldErrorsFromZod(parsed.error));

  const settings = await getSettings();
  if (!isBefore(settings.registrationDeadline)) throw new AppError("Team registration is closed.", 403);

  const data = parsed.data;
  const captain = data.members[0];
  if (captain.email !== user.email || captain.studentId !== user.studentId) {
    throw new AppError("You must be the first member and the team captain.", 400, {
      "members.0.email": "Use the Brunel email on your account.",
      "members.0.studentId": "Use the student ID on your account.",
    });
  }

  const owned = await prisma.team.findUnique({ where: { ownerId: userId } });
  if (!teamId && owned) throw new AppError("You already have a team. Update it instead.", 409);
  if (teamId && (!owned || owned.id !== teamId)) throw new AppError("That team is not yours.", 404);

  const namedTeams = await prisma.team.findMany({
    where: teamId ? { id: { not: teamId } } : undefined,
    select: { name: true },
  });
  const nameTaken = namedTeams.some((team) => team.name.localeCompare(data.teamName, "en", { sensitivity: "accent" }) === 0);
  if (nameTaken) throw new AppError("That team name is already taken.", 409, { teamName: "That team name is already taken." });

  const ids = data.members.map((member) => member.studentId);
  const emails = data.members.map((member) => member.email);
  const conflicts = await prisma.teamMember.findMany({
    where: {
      ...(teamId ? { teamId: { not: teamId } } : {}),
      OR: [{ studentId: { in: ids } }, { email: { in: emails } }],
    },
  });
  if (conflicts.length > 0) {
    const fieldErrors: Record<string, string> = {};
    data.members.forEach((member, index) => {
      const idClash = conflicts.find((row) => row.studentId === member.studentId);
      const emailClash = conflicts.find((row) => row.email === member.email);
      if (idClash) fieldErrors[`members.${index}.studentId`] = "This student ID is already registered on another team.";
      if (emailClash) fieldErrors[`members.${index}.email`] = "This email is already registered on another team.";
    });
    throw new AppError("A student on this form is already registered.", 409, fieldErrors);
  }

  try {
    const team = await prisma.$transaction(async (tx) => {
      const members = data.members.map((member, index) => ({ ...member, isCaptain: index === 0 }));
      if (!teamId) {
        const latest = await tx.team.aggregate({ _max: { displayNumber: true } });
        return tx.team.create({
          data: {
            name: data.teamName,
            displayNumber: (latest._max.displayNumber ?? 0) + 1,
            ownerId: userId,
            members: { create: members },
          },
          include: teamInclude,
        });
      }
      await tx.teamMember.deleteMany({ where: { teamId } });
      return tx.team.update({
        where: { id: teamId },
        data: { name: data.teamName, members: { create: members } },
        include: teamInclude,
      });
    });

    await prisma.user.update({ where: { id: userId }, data: { name: captain.fullName } });
    const message = teamRegistrationEmail({
      teamName: team.name,
      captain: captain.fullName,
      members: team.members.map((member) => `${member.fullName} (${member.email})`).join(", "),
      when: formatWhen(team.updatedAt),
    });
    await deliverEmail({
      userId,
      teamId: team.id,
      type: "TEAM_REGISTRATION",
      to: team.members.map((member) => member.email),
      ...message,
    });
    return team;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("A team or student with those details already exists.", 409);
    }
    throw error;
  }
}
