import bcrypt from "bcryptjs";
import { AWARD_DEFINITIONS, TRACKS } from "../src/lib/awards";
import { prisma } from "../src/lib/prisma";

const JUDGES = [
  { name: "Amira Khan", email: "amira.khan@brunel.ac.uk" },
  { name: "James Okonkwo", email: "james.okonkwo@brunel.ac.uk" },
  { name: "Priya Shah", email: "priya.shah@brunel.ac.uk" },
];

export async function seed() {
  for (const track of TRACKS) {
    await prisma.track.upsert({
      where: { slug: track.slug },
      update: { name: track.name, summary: track.summary },
      create: track,
    });
  }

  if (process.env.SHOW_DEMO_ACCOUNTS === "true") {
    const passwordHash = await bcrypt.hash("BrunelJudge2026!", 12);
    for (const judge of JUDGES) {
      await prisma.user.upsert({
        where: { email: judge.email },
        update: { name: judge.name, role: "JUDGE", passwordHash },
        create: { ...judge, role: "JUDGE", passwordHash },
      });
    }
  }

  await prisma.hackathonSettings.upsert({
    where: { id: "hackathon" },
    update: {},
    create: {
      id: "hackathon",
      name: "Brunel Build 2026",
      venue: "Eastern Gateway, Brunel University London",
      eventLabel: "Saturday 14 – Sunday 15 November 2026",
      registrationDeadline: new Date("2026-11-06T17:00:00.000Z"),
      submissionDeadline: new Date("2026-11-15T18:00:00.000Z"),
      judgingDeadline: new Date("2026-11-16T21:00:00.000Z"),
      blindJudging: false,
    },
  });

  for (const award of AWARD_DEFINITIONS) {
    await prisma.award.upsert({
      where: { type: award.type },
      update: { label: award.title, detail: award.rule },
      create: { type: award.type, label: award.title, detail: award.rule },
    });
  }
}

const entry = process.argv[1]?.replaceAll("\\", "/");
if (entry?.endsWith("/prisma/seed.ts")) {
  seed()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
