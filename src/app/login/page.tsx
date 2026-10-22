import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth-forms";
import { Shell } from "@/components/shell";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "JUDGE" ? "/judge" : "/participant");

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto max-w-lg">
        <LoginForm showDemo={process.env.SHOW_DEMO_ACCOUNTS === "true"} />
      </div>
    </Shell>
  );
}
