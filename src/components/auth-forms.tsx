"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, readJson } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loadRegisterDraft, loadRememberedAccount, rememberAccount, saveRegisterDraft, type AccountRole, type RememberedAccount } from "@/lib/local-account";

export function LoginForm({ showDemo }: { showDemo: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [remembered, setRemembered] = useState<RememberedAccount | null>(null);

  useEffect(() => {
    const account = loadRememberedAccount();
    if (!account) return;
    setRemembered(account);
    setEmail(account.email);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const signedInEmail = String(form.get("email") ?? "");
    const result = await signIn("credentials", {
      email: signedInEmail,
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    if (result?.error) {
      setError("Those details were not recognised.");
      setPending(false);
      return;
    }
    const me = await fetch("/api/me");
    const profile = (await me.json()) as { role?: string; name?: string; email?: string };
    if (profile.email && (profile.role === "PARTICIPANT" || profile.role === "JUDGE")) {
      const previous = loadRememberedAccount();
      rememberAccount({
        name: profile.name || previous?.name || "",
        email: profile.email,
        studentId: previous && previous.email === profile.email ? previous.studentId : "",
        role: profile.role,
      });
    }
    toast.success("Signed in.");
    router.push(profile.role === "JUDGE" ? "/judge" : "/participant");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          {remembered?.name
            ? `Welcome back, ${remembered.name}. This browser remembers your account.`
            : "Participants and judges each sign in with the account they created."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          <Field label="Email" htmlFor="email" error={error ? " " : undefined}>
            <Input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password" error={error || undefined}>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        {showDemo ? (
          <div className="mt-5 rounded-xl bg-secondary p-4 text-sm">
            <p className="font-semibold">Judge demo accounts</p>
            <p className="mt-1 text-muted-foreground">Password for each judge: BrunelJudge2026!</p>
            <ul className="mt-2 space-y-1">
              <li>amira.khan@brunel.ac.uk</li>
              <li>james.okonkwo@brunel.ac.uk</li>
              <li>priya.shah@brunel.ac.uk</li>
            </ul>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-muted-foreground">
          New participant? <Link className="font-semibold text-foreground underline" href="/register/participant">Create a participant account</Link>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          New judge? <Link className="font-semibold text-foreground underline" href="/register/judge">Create a judge account</Link>
        </p>
      </CardContent>
    </Card>
  );
}

const emptyDraft = { name: "", studentId: "", email: "" };

function useRegisterDraft(role: AccountRole) {
  const [draft, setDraft] = useState(emptyDraft);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    const saved = loadRegisterDraft(role);
    if (saved) setDraft(saved);
    setDraftReady(true);
  }, [role]);

  useEffect(() => {
    if (!draftReady) return;
    saveRegisterDraft(role, draft);
  }, [draft, draftReady, role]);

  function updateDraft(field: keyof typeof emptyDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return { draft, updateDraft };
}

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const { draft, updateDraft } = useRegisterDraft("PARTICIPANT");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: draft.name,
      studentId: draft.studentId,
      email: draft.email,
      password: String(form.get("password") ?? ""),
    };
    saveRegisterDraft("PARTICIPANT", draft);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readJson(response);
    if (!response.ok) {
      setErrors(result.fieldErrors);
      setFormError(result.error);
      setPending(false);
      return;
    }
    rememberAccount({ name: payload.name, email: payload.email, studentId: payload.studentId, role: "PARTICIPANT" });
    const signedIn = await signIn("credentials", { email: payload.email, password: payload.password, redirect: false });
    if (signedIn?.error) {
      toast.success("Account created. Sign in to continue.");
      router.push("/login");
      return;
    }
    toast.success("Account created.");
    router.push("/participant");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a participant account</CardTitle>
        <CardDescription>Use your Brunel email and student ID. This account can register a team and submit a project. Judges use a separate form.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(errors.name)} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
          </Field>
          <Field label="Student ID" htmlFor="studentId" error={errors.studentId} hint="7 digits, for example 1234567.">
            <Input id="studentId" name="studentId" inputMode="numeric" autoComplete="off" required aria-invalid={Boolean(errors.studentId)} value={draft.studentId} onChange={(event) => updateDraft("studentId", event.target.value)} />
          </Field>
          <Field label="Brunel email" htmlFor="email" error={errors.email} hint="Must end with @student.brunel.ac.uk or @brunel.ac.uk. Your details stay in this browser if you leave the page.">
            <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
            <Input id="password" name="password" type="password" autoComplete="new-password" required aria-invalid={Boolean(errors.password)} />
          </Field>
          {formError && Object.keys(errors).length === 0 ? <p className="text-sm text-destructive" role="alert">{formError}</p> : null}
          <Button type="submit" disabled={pending}>{pending ? "Creating account…" : "Create participant account"}</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already registered? <Link className="font-semibold text-foreground underline" href="/login">Sign in</Link>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Judging instead? <Link className="font-semibold text-foreground underline" href="/register/judge">Create a judge account</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function JudgeRegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const { draft, updateDraft } = useRegisterDraft("JUDGE");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: draft.name,
      email: draft.email,
      password: String(form.get("password") ?? ""),
    };
    saveRegisterDraft("JUDGE", draft);
    const response = await fetch("/api/register/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readJson(response);
    if (!response.ok) {
      setErrors(result.fieldErrors);
      setFormError(result.error);
      setPending(false);
      return;
    }
    rememberAccount({ name: payload.name, email: payload.email, studentId: "", role: "JUDGE" });
    const signedIn = await signIn("credentials", { email: payload.email, password: payload.password, redirect: false });
    if (signedIn?.error) {
      toast.success("Judge account created. Sign in to continue.");
      router.push("/login");
      return;
    }
    toast.success("Judge account created.");
    router.push("/judge");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a judge account</CardTitle>
        <CardDescription>For judges and sponsors. Use Gmail, a company email, or a Brunel staff email. This account scores projects and opens the leaderboard. It cannot register a team.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(errors.name)} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email} hint="Gmail and sponsor emails are welcome. Student emails ending in @student.brunel.ac.uk are for participant accounts. Your details stay in this browser if you leave the page.">
            <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
            <Input id="password" name="password" type="password" autoComplete="new-password" required aria-invalid={Boolean(errors.password)} />
          </Field>
          {formError && Object.keys(errors).length === 0 ? <p className="text-sm text-destructive" role="alert">{formError}</p> : null}
          <Button type="submit" disabled={pending}>{pending ? "Creating account…" : "Create judge account"}</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already registered? <Link className="font-semibold text-foreground underline" href="/login">Sign in</Link>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Joining a team? <Link className="font-semibold text-foreground underline" href="/register/participant">Create a participant account</Link>
        </p>
      </CardContent>
    </Card>
  );
}
