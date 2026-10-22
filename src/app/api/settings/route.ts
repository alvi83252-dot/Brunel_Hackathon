import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/security";
import { settingsSchema } from "@/lib/validators";
import { jsonError } from "@/server/errors";
import { requireUser } from "@/server/guards";
import { getSettings } from "@/server/settings";

export async function GET() {
  try {
    await requireUser("JUDGE");
    const settings = await getSettings();
    return NextResponse.json({
      blindJudging: settings.blindJudging,
      registrationDeadline: settings.registrationDeadline,
      submissionDeadline: settings.submissionDeadline,
      judgingDeadline: settings.judgingDeadline,
      name: settings.name,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireUser("JUDGE");
    const parsed = settingsSchema.parse(await readJsonBody(request));
    const settings = await prisma.hackathonSettings.update({
      where: { id: "hackathon" },
      data: { blindJudging: parsed.blindJudging },
    });
    return NextResponse.json({ blindJudging: settings.blindJudging });
  } catch (error) {
    return jsonError(error);
  }
}
