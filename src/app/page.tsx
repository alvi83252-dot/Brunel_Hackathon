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
      <section className="reveal grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.35fr)_22rem]">
        <div className="panel flex flex-col justify-end px-6 py-8 sm:px-8 sm:py-10">
          <p className="kicker text-accent">Brunel Build 2026</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Brunel University Hackathon
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Register a team, submit an idea, and hand in a repository. Judges score in the open or blind. The leaderboard stays with the judges.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
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
        <aside className="panel reveal reveal-delay-1 px-5 py-6 sm:px-6">
          <p className="kicker">{settings?.venue ?? "Eastern Gateway, Brunel University London"}</p>
          <h2 className="mt-2 font-display text-2xl">Key dates</h2>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {deadlines.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 text-sm sm:grid-cols-[8.5rem_1fr] sm:gap-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="panel reveal reveal-delay-2 mt-6 grid md:grid-cols-3 md:divide-x md:divide-border">
        {steps.map(([index, title, copy]) => (
          <article key={title} className="border-b border-border px-5 py-5 last:border-b-0 md:border-b-0 md:px-6 md:py-6">
            <p className="font-display text-sm text-accent">{index}</p>
            <h2 className="mt-2 text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          </article>
        ))}
      </section>

      <section className="panel reveal reveal-delay-3 mt-6 overflow-hidden">
        <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
          <div>
            <p className="kicker">Programme</p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl">Tracks</h2>
          </div>
          <p className="hidden text-sm font-medium text-muted-foreground sm:block">{tracks.length} tracks</p>
        </div>
        <ul className="divide-y divide-border">
          {tracks.map((track, index) => (
            <li key={track.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[3rem_minmax(12rem,18rem)_1fr] sm:items-baseline sm:gap-5 sm:px-6">
              <span className="font-display text-base text-accent">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-lg font-semibold">{track.name}</h3>
              <p className="text-base leading-7 text-muted-foreground">{track.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
