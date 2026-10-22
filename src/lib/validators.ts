import { z } from "zod";
import { CRITERIA, RECOMMENDATIONS } from "@/lib/scoring";
import { cleanMultiline, cleanText } from "@/lib/sanitize";

const BRUNEL_EMAIL = /^[a-z0-9._%+-]+@(student\.brunel\.ac\.uk|brunel\.ac\.uk)$/i;
const STUDENT_ID = /^\d{7}$/;
const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

function isPersonName(value: string) {
  return /\p{L}.*\p{L}/u.test(value) && /^[\p{L}\p{M}\s.'’\u2013\u2014-]+$/u.test(value);
}

const requiredText = (max: number, emptyMessage: string) =>
  z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(1, emptyMessage).max(max, `Use ${max} characters or fewer.`));

const requiredMultiline = (max: number, emptyMessage: string) =>
  z
    .string()
    .transform(cleanMultiline)
    .pipe(z.string().min(1, emptyMessage).max(max, `Use ${max} characters or fewer.`));

const personName = z
  .string()
  .transform(cleanText)
  .pipe(
    z
      .string()
      .min(2, "Enter a full name.")
      .max(80, "Use 80 characters or fewer.")
      .refine(isPersonName, "Use letters, spaces, apostrophes, or hyphens."),
  );

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export const registerSchema = z.object({
  name: personName,
  studentId: z.string().trim().regex(STUDENT_ID, "Enter a 7-digit Brunel student ID."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(BRUNEL_EMAIL, "Use an email ending in @student.brunel.ac.uk or @brunel.ac.uk."),
  password: passwordSchema,
});

export const judgeRegisterSchema = z.object({
  name: personName,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .refine((value) => !value.endsWith("@student.brunel.ac.uk"), "Student emails are for participant accounts."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const memberSchema = z.object({
  fullName: personName,
  studentId: z.string().trim().regex(STUDENT_ID, "Enter a 7-digit Brunel student ID."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(BRUNEL_EMAIL, "Use an email ending in @student.brunel.ac.uk or @brunel.ac.uk."),
});

export const teamSchema = z
  .object({
    teamName: z
      .string()
      .transform(cleanText)
      .pipe(z.string().min(2, "Enter a team name.").max(60, "Use 60 characters or fewer.")),
    members: z.array(memberSchema).min(2, "A team needs at least 2 members.").max(6, "A team can have at most 6 members."),
  })
  .superRefine((value, context) => {
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();
    value.members.forEach((member, index) => {
      if (seenIds.has(member.studentId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["members", index, "studentId"],
          message: "This student ID is already used on this team.",
        });
      } else {
        seenIds.add(member.studentId);
      }
      if (seenEmails.has(member.email)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["members", index, "email"],
          message: "This email is already used on this team.",
        });
      } else {
        seenEmails.add(member.email);
      }
    });
  });

export const ideaSchema = z.object({
  trackId: z.string().min(1, "Choose a track."),
  title: requiredText(100, "Enter a project title."),
  shortDescription: requiredText(300, "Enter a short description."),
  problemStatement: requiredMultiline(1000, "Describe the problem."),
  proposedSolution: requiredMultiline(1000, "Describe the proposed solution."),
  expectedImpact: requiredMultiline(1000, "Describe the expected impact."),
});

const optionalHttps = z
  .string()
  .transform((value) => cleanText(value))
  .pipe(
    z
      .string()
      .max(300, "Use 300 characters or fewer.")
      .refine((value) => value === "" || isHttpsUrl(value), "Enter a full link starting with https://."),
  );

export const submissionSchema = z.object({
  githubUrl: z.string().transform(cleanText).pipe(z.string().min(1, "Enter a GitHub repository URL.")),
  demoUrl: optionalHttps,
  docsUrl: optionalHttps,
  notes: z
    .string()
    .transform(cleanMultiline)
    .pipe(z.string().max(1000, "Use 1000 characters or fewer.")),
});

export function canonicalGithubRepo(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !GITHUB_HOSTS.has(url.hostname.toLowerCase())) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    let repo = parts[1] ?? "";
    if (repo.toLowerCase().endsWith(".git")) repo = repo.slice(0, -4);
    if (!/^[\w.-]+$/.test(parts[0] ?? "") || !/^[\w.-]+$/.test(repo) || !repo) return null;
    return `https://github.com/${parts[0]}/${repo}`;
  } catch {
    return null;
  }
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

const scoreValue = z.number({ invalid_type_error: "Choose a score from 1 to 10." }).int().min(1).max(10).nullable();

export const scoreSchema = z
  .object({
    projectId: z.string().min(1),
    technical: scoreValue,
    innovation: scoreValue,
    impact: scoreValue,
    solution: scoreValue,
    sponsor: scoreValue,
    business: scoreValue,
    presentation: scoreValue,
    technicalNote: z.string().transform(cleanMultiline).pipe(z.string().max(1000)),
    innovationNote: z.string().transform(cleanMultiline).pipe(z.string().max(1000)),
    impactNote: z.string().transform(cleanMultiline).pipe(z.string().max(1000)),
    solutionNote: z.string().transform(cleanMultiline).pipe(z.string().max(1000)),
    sponsorNote: z.string().transform(cleanMultiline).pipe(z.string().max(1000)),
    businessNote: z.string().transform(cleanMultiline).pipe(z.string().max(1000)),
    presentationNote: z.string().transform(cleanMultiline).pipe(z.string().max(1000)),
    overallFeedback: z.string().transform(cleanMultiline).pipe(z.string().max(2000)),
    recommendation: z.enum(["STRONGLY_RECOMMEND", "RECOMMEND", "NEUTRAL", "DO_NOT_RECOMMEND"]).nullable(),
    status: z.enum(["DRAFT", "SUBMITTED"]),
  })
  .superRefine((value, context) => {
    if (value.status !== "SUBMITTED") return;
    for (const criterion of CRITERIA) {
      if (value[criterion.key] == null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [criterion.key],
          message: `Score ${criterion.label} from 1 to 10.`,
        });
      }
      const noteKey = `${criterion.key}Note` as const;
      if (!value[noteKey]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [noteKey],
          message: "Add a short comment for this criterion.",
        });
      }
    }
    if (!value.overallFeedback) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["overallFeedback"],
        message: "Add overall feedback before submitting.",
      });
    }
    if (!value.recommendation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recommendation"],
        message: "Choose a recommendation.",
      });
    }
  });

export const settingsSchema = z.object({
  blindJudging: z.boolean(),
});

export type TeamInput = z.infer<typeof teamSchema>;
export type IdeaInput = z.infer<typeof ideaSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ScoreInput = z.infer<typeof scoreSchema>;

export function fieldErrorsFromZod(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
  }
  return fieldErrors;
}

export function recommendationValues() {
  return RECOMMENDATIONS.map((item) => item.value);
}
