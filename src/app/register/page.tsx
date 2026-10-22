import Link from "next/link";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { redirectIfSignedIn } from "@/server/guards";

export default async function RegisterPage() {
  await redirectIfSignedIn();

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto max-w-4xl">
        <p className="kicker">Accounts</p>
        <h1 className="mt-3 max-w-xl text-5xl leading-tight">Choose how you are taking part.</h1>
        <div className="mt-10 grid border border-border bg-card md:grid-cols-2 md:divide-x md:divide-border">
          <section className="flex flex-col gap-4 p-6 sm:p-8">
            <p className="kicker">Students</p>
            <h2 className="font-display text-3xl">Participant</h2>
            <p className="text-sm leading-6 text-muted-foreground">Register a team, submit an idea, and hand in a repository. Rankings are not shown on this side.</p>
            <Button asChild className="mt-2 w-fit">
              <Link href="/register/participant">Create a participant account</Link>
            </Button>
          </section>
          <section className="flex flex-col gap-4 border-t border-border p-6 sm:p-8 md:border-t-0">
            <p className="kicker">Review</p>
            <h2 className="font-display text-3xl">Judge</h2>
            <p className="text-sm leading-6 text-muted-foreground">For invited judges and sponsors. Use the organiser invite code, then sign in to score projects and open the leaderboard.</p>
            <Button asChild className="mt-2 w-fit" variant="secondary">
              <Link href="/register/judge">Create a judge account</Link>
            </Button>
          </section>
        </div>
      </div>
    </Shell>
  );
}
