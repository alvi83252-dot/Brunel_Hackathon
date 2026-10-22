import { Shell } from "@/components/shell";
import { requirePageUser } from "@/server/guards";

const links = [
  { href: "/participant", label: "Dashboard" },
  { href: "/participant/team", label: "Team" },
  { href: "/participant/idea", label: "Idea" },
  { href: "/participant/submission", label: "Submission" },
  { href: "/participant/notifications", label: "Emails" },
];

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("PARTICIPANT");

  return (
    <Shell home="/participant" eyebrow="Participant Portal" links={links} user={{ name: user.name, email: user.email }}>
      {children}
    </Shell>
  );
}
