import { escapeHtml } from "@/lib/utils";

type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function layout(title: string, intro: string, rows: Array<[string, string]>) {
  const text = [title, "", intro, "", ...rows.map(([label, value]) => `${label}: ${value}`), "", "Brunel University London", "Hackathon Management Portal"].join("\n");
  const details = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#4E6078;font-size:14px;vertical-align:top;width:180px;">${escapeHtml(label)}</td><td style="padding:8px 0;color:#102033;font-size:14px;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><body style="margin:0;background:#F5F7FA;font-family:Segoe UI,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:24px 12px;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#07294D;padding:24px 28px;border-bottom:4px solid #F37021;">
        <p style="margin:0;color:#F37021;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Brunel University London</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;">Hackathon Management Portal</h1>
      </td></tr>
      <tr><td style="padding:28px;">
        <h2 style="margin:0 0 12px;color:#07294D;font-size:20px;">${escapeHtml(title)}</h2>
        <p style="margin:0 0 16px;color:#24364d;font-size:15px;line-height:1.5;">${escapeHtml(intro)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${details}</table>
      </td></tr>
      <tr><td style="padding:16px 28px 24px;color:#4E6078;font-size:12px;">This message was sent because a Brunel hackathon team used this address. Eastern Gateway, Brunel University London.</td></tr>
    </table>
  </td></tr></table></body></html>`;
  return { text, html };
}

export function teamRegistrationEmail(input: { teamName: string; captain: string; members: string; when: string }): EmailContent {
  const body = layout(
    "Team registration confirmed",
    "Your team is registered for the Brunel University hackathon. You can update members until the registration deadline, then submit your idea and repository from the participant portal.",
    [
      ["Team", input.teamName],
      ["Captain", input.captain],
      ["Members", input.members],
      ["Registered", input.when],
    ],
  );
  return { subject: `Team registered: ${input.teamName}`, ...body };
}

export function ideaSubmissionEmail(input: { teamName: string; title: string; track: string; when: string }): EmailContent {
  const body = layout(
    "Idea submission confirmed",
    "Your project idea is on file. You can edit it until the submission deadline, then add the GitHub repository to complete the entry.",
    [
      ["Team", input.teamName],
      ["Project", input.title],
      ["Track", input.track],
      ["Submitted", input.when],
    ],
  );
  return { subject: `Idea received: ${input.title}`, ...body };
}

export function finalSubmissionEmail(input: { teamName: string; title: string; githubUrl: string; when: string }): EmailContent {
  const body = layout(
    "Final submission confirmed",
    "Your repository has been received. Judges can review the project once judging opens. You can still update the submission until the deadline.",
    [
      ["Team", input.teamName],
      ["Project", input.title],
      ["GitHub", input.githubUrl],
      ["Submitted", input.when],
    ],
  );
  return { subject: `Final submission received: ${input.title}`, ...body };
}
