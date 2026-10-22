import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Confirmation emails</h1>
        <p className="mt-1 text-muted-foreground">
          Each registration and submission writes a branded message. When SMTP is configured, the same message is delivered.
        </p>
      </div>
      {notifications.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No emails yet</CardTitle>
            <CardDescription>Register a team, then submit an idea and a repository. Each step records a confirmation.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={notification.delivery === "SENT" ? "success" : notification.delivery === "FAILED" ? "warning" : "muted"}>
                  {notification.delivery === "SENT" ? "Sent" : notification.delivery === "FAILED" ? "Delivery failed" : "Recorded"}
                </Badge>
                <Badge>{labels[notification.type]}</Badge>
              </div>
              <CardTitle className="text-xl">{notification.subject}</CardTitle>
              <CardDescription>
                To {notification.toEmail} · {formatWhen(notification.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <pre className="whitespace-pre-wrap rounded-xl bg-secondary p-4 text-sm">{notification.text}</pre>
              <details>
                <summary className="cursor-pointer text-sm font-semibold">View branded template</summary>
                <iframe title={notification.subject} className="mt-3 h-80 w-full rounded-xl border border-border bg-white" sandbox="" srcDoc={notification.html} />
              </details>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
