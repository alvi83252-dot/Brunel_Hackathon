import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/errors";

export async function getSettings() {
  const settings = await prisma.hackathonSettings.findUnique({ where: { id: "hackathon" } });
  if (!settings) throw new AppError("The hackathon has not been configured yet.", 500);
  return settings;
}

export function isBefore(deadline: Date, now = new Date()) {
  return now.getTime() <= deadline.getTime();
}
