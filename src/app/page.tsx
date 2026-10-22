import Link from "next/link";
import { auth } from "@/auth";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";

export default async function HomePage() {
  const session = await auth();
  const settings = await prisma.hackathonSettings.findUnique({ where: { id: "hackathon" } });
  const tracks = await prisma.track.findMany({ orderBy: { name: "asc" } });
  const destination = session?.user.role === "JUDGE" ? "/judge" : "/participant";

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]} user={session?.user ? { name: session.user.name ?? "", email: session.user.email ?? "" } : null}>
      <section className="grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <Badge variant="accent">Brunel Build 2026</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-[#07294D] sm:text-5xl dark:text-foreground">
            Run the hackathon from registration to the winning team.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            Participants register a team, submit an idea, and hand in a GitHub repository. Judges score in the open or blind, and the leaderboard and awards stay on the judge side.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {session?.user ? (
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
        <Card>
          <CardHeader>
            <CardTitle>Deadlines</CardTitle>
            <CardDescription>{settings?.venue ?? "Eastern Gateway, Brunel University London"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <p><span className="font-semibold">Event.</span> {settings?.eventLabel ?? "14–15 November 2026"}</p>
            <p><span className="font-semibold">Team registration.</span> {formatWhen(settings?.registrationDeadline)}</p>
            <p><span className="font-semibold">Idea and repository.</span> {formatWhen(settings?.submissionDeadline)}</p>
            <p><span className="font-semibold">Judging.</span> {formatWhen(settings?.judgingDeadline)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["1. Register", "Create an account with your Brunel email, then add 2–6 teammates."],
          ["2. Submit", "Choose a track, describe the idea, and add the GitHub repository."],
          ["3. Judging", "Judges score seven weighted criteria. Participants never see the ranking."],
        ].map(([title, copy]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{copy}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Tracks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Card key={track.id}>
              <CardHeader>
                <CardTitle className="text-lg">{track.name}</CardTitle>
                <CardDescription>{track.summary}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  );
}
