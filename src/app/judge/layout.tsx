import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Shell } from "@/components/shell";

const links = [
  { href: "/judge", label: "Dashboard" },
  { href: "/judge/projects", label: "Projects" },
  { href: "/judge/leaderboard", label: "Leaderboard" },
  { href: "/judge/awards", label: "Awards" },
  { href: "/judge/settings", label: "Blind judging" },
];

export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "JUDGE") redirect("/participant");

  return (
    <Shell home="/judge" eyebrow="Judge Portal" links={links} user={{ name: session.user.name ?? "Judge", email: session.user.email ?? "" }}>
      {children}
    </Shell>
  );
}
