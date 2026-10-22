import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth-forms";
import { Shell } from "@/components/shell";

export default async function ParticipantRegisterPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "JUDGE" ? "/judge" : "/participant");

  return (
    <Shell home="/" eyebrow="Hackathon Management Portal" links={[]}>
      <div className="mx-auto max-w-lg">
        <RegisterForm />
      </div>
    </Shell>
  );
}
