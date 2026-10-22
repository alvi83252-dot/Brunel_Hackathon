import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

type NotificationType = "TEAM_REGISTRATION" | "IDEA_SUBMISSION" | "FINAL_SUBMISSION";

export async function deliverEmail(input: {
  userId: string;
  teamId?: string;
  type: NotificationType;
  to: string[];
  subject: string;
  html: string;
  text: string;
}) {
  const recipients = [...new Set(input.to.map((email) => email.toLowerCase()))];
  let delivery: "SENT" | "LOGGED" | "FAILED" = "LOGGED";
  const host = process.env.SMTP_HOST?.trim();

  if (host) {
    try {
      const port = Number(process.env.SMTP_PORT || 587);
      const transport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
      });
      await transport.sendMail({
        from: process.env.SMTP_FROM || "Brunel Hackathon <hackathon@brunel.ac.uk>",
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      delivery = "SENT";
    } catch (error) {
      console.error("Email delivery failed", error);
      delivery = "FAILED";
    }
  }

  await prisma.notification.createMany({
    data: recipients.map((toEmail) => ({
      userId: input.userId,
      teamId: input.teamId,
      type: input.type,
      subject: input.subject,
      html: input.html,
      text: input.text,
      toEmail,
      delivery,
    })),
  });

  return delivery;
}
