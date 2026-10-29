import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { formatWhen } from "@/lib/utils";
import { requireUser } from "@/server/guards";

const labels = {
  TEAM_REGISTRATION: "Team registration",
  IDEA_SUBMISSION: "Idea submission",
  FINAL_SUBMISSION: "Final submission",
} as const;

export default async function NotificationsPage() {
  const user = await requireUser("PARTICIPANT");
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        kicker="Record"
        title="Confirmation emails"
        description="Each registration and submission writes a branded message. When SMTP is configured, the same message is delivered."
      />
      {notifications.length === 0 ? (
        <p className="panel px-4 py-10 text-sm text-muted-foreground">
          Register a team, then submit an idea and a repository. Each step records a confirmation.
        </p>
      ) : (
        <ol className="divide-y divide-border border-b border-border">
          {notifications.map((notification) => (
            <li key={notification.id} className="py-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={notification.delivery === "SENT" ? "success" : notification.delivery === "FAILED" ? "warning" : "muted"}>
                  {notification.delivery === "SENT" ? "Sent" : notification.delivery === "FAILED" ? "Delivery failed" : "Recorded"}
                </Badge>
                <Badge>{labels[notification.type as keyof typeof labels]}</Badge>
              </div>
              <h2 className="mt-3 font-display text-2xl">{notification.subject}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                To {notification.toEmail} · {formatWhen(notification.createdAt)}
              </p>
              <pre className="mt-4 whitespace-pre-wrap border border-border bg-secondary/50 p-4 font-sans text-sm leading-6">{notification.text}</pre>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold">View branded template</summary>
                <iframe title={notification.subject} className="mt-3 h-80 w-full border border-border bg-white" sandbox="" referrerPolicy="no-referrer" srcDoc={notification.html} />
              </details>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
