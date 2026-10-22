import { LoginForm } from "@/components/auth-forms";
import { Shell } from "@/components/shell";
import { redirectIfSignedIn } from "@/server/guards";

export default async function LoginPage() {
  await redirectIfSignedIn();

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto max-w-lg">
        <p className="kicker mb-6">Account</p>
        <LoginForm />
      </div>
    </Shell>
  );
}
