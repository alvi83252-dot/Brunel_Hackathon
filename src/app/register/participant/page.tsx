import { RegisterForm } from "@/components/auth-forms";
import { Shell } from "@/components/shell";
import { redirectIfSignedIn } from "@/server/guards";

export default async function ParticipantRegisterPage() {
  await redirectIfSignedIn();

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto max-w-lg">
        <RegisterForm />
      </div>
    </Shell>
  );
}
