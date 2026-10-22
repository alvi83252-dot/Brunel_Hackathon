import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Shell } from "@/components/shell";

const links = [
  { href: "/participant", label: "Dashboard" },
  { href: "/participant/team", label: "Team" },
  { href: "/participant/idea", label: "Idea" },
  { href: "/participant/submission", label: "Submission" },
  { href: "/participant/notifications", label: "Emails" },
];

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARTICIPANT") redirect("/judge");

  return (
    <Shell home="/participant" eyebrow="Participant Portal" links={links} user={{ name: session.user.name ?? "Participant", email: session.user.email ?? "" }}>
      {children}
    </Shell>
  );
}
