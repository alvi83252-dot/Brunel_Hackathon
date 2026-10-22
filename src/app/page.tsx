import Link from "next/link";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { currentUser } from "@/server/guards";

export default async function HomePage() {
  const user = await currentUser();
  const settings = await prisma.hackathonSettings.findUnique({ where: { id: "hackathon" } });
  const tracks = await prisma.track.findMany({ orderBy: { name: "asc" } });
  const destination = user?.role === "JUDGE" ? "/judge" : "/participant";
  const steps = [
    ["01", "Register", "Create an account with a Brunel email, then add a team of 2–6."],
    ["02", "Submit", "Choose a track, describe the idea, and attach the GitHub repository."],
    ["03", "Judging", "Judges score seven weighted criteria. Rankings stay on the judge side."],
  ];
  const deadlines = [
    ["Event", settings?.eventLabel ?? "14–15 November 2026"],
    ["Team registration", formatWhen(settings?.registrationDeadline)],
    ["Idea and repository", formatWhen(settings?.submissionDeadline)],
    ["Judging", formatWhen(settings?.judgingDeadline)],
  ];

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]} user={user ? { name: user.name, email: user.email } : null}>
      <section className="grid items-end gap-12 border-b border-border pb-14 lg:grid-cols-[minmax(0,1.4fr)_20rem]">
        <div>
          <p className="kicker">Brunel Build 2026</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] text-foreground sm:text-6xl">
            From registration to the winning team.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Participants register a team, submit an idea, and hand in a repository. Judges score in the open or blind. The leaderboard and awards stay with the judges.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Button asChild size="lg">
                <Link href={destination}>Open your portal</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/register/participant">Register as a participant</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/register/judge">Judge or sponsor sign-up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <aside>
          <p className="kicker">{settings?.venue ?? "Eastern Gateway, Brunel University London"}</p>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {deadlines.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[9rem_1fr] gap-3 py-3 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="grid border-b border-border md:grid-cols-3 md:divide-x md:divide-border">
        {steps.map(([index, title, copy]) => (
          <article key={title} className="py-8 md:px-6 md:first:pl-0 md:last:pr-0">
            <p className="font-display text-sm text-accent">{index}</p>
            <h2 className="mt-3 text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          </article>
        ))}
      </section>

      <section className="pt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Programme</p>
            <h2 className="mt-2 font-display text-4xl">Tracks</h2>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">{tracks.length} tracks</p>
        </div>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {tracks.map((track, index) => (
            <li key={track.id} className="grid gap-2 py-5 sm:grid-cols-[3rem_14rem_1fr] sm:items-baseline sm:gap-6">
              <span className="font-display text-sm text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-base font-semibold">{track.name}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{track.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
