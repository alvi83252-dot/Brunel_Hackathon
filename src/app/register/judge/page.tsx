import { JudgeRegisterForm } from "@/components/auth-forms";
import { Shell } from "@/components/shell";
import { redirectIfSignedIn } from "@/server/guards";

export default async function JudgeRegisterPage() {
  await redirectIfSignedIn();

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto max-w-lg">
        <JudgeRegisterForm />
      </div>
    </Shell>
  );
}
