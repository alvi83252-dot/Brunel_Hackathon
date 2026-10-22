import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JudgeRegisterForm } from "@/components/auth-forms";
import { Shell } from "@/components/shell";

export default async function JudgeRegisterPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "JUDGE" ? "/judge" : "/participant");

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto max-w-lg">
        <JudgeRegisterForm />
      </div>
    </Shell>
  );
}
