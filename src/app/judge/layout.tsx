import { Shell } from "@/components/shell";
import { requirePageUser } from "@/server/guards";

const links = [
  { href: "/judge", label: "Dashboard" },
  { href: "/judge/projects", label: "Projects" },
  { href: "/judge/leaderboard", label: "Leaderboard" },
  { href: "/judge/awards", label: "Awards" },
  { href: "/judge/settings", label: "Blind judging" },
];

export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("JUDGE");

  return (
    <Shell home="/judge" eyebrow="Judge Portal" links={links} user={{ name: user.name, email: user.email }}>
      {children}
    </Shell>
  );
}
