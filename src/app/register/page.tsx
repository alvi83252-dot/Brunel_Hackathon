import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "JUDGE" ? "/judge" : "/participant");

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Participant account</CardTitle>
            <CardDescription>For students registering a team, submitting an idea, and handing in a repository.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/register/participant">Create a participant account</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Judge account</CardTitle>
            <CardDescription>For judges and sponsors. Sign in with Gmail, a company email, or a Brunel staff email to score projects and open the leaderboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/register/judge">Create a judge account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
