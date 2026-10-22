"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Field, readJson } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Values = { githubUrl: string; demoUrl: string; docsUrl: string; notes: string };

export function SubmissionForm({
  locked,
  submissionId,
  submittedAt,
  initial,
}: {
  locked: boolean;
  submissionId?: string;
  submittedAt?: string | null;
  initial: Values;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (locked) return;
    setPending(true);
    setErrors({});
    const response = await fetch(submissionId ? `/api/submissions/${submissionId}` : "/api/submissions", {
      method: submissionId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await readJson(response);
    if (!response.ok) {
      setErrors(result.fieldErrors);
      toast.error(result.error);
      setPending(false);
      return;
    }
    toast.success("Submission successful.");
    router.refresh();
    setPending(false);
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      {submittedAt ? (
        <div className="border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100" role="status">
          <p className="text-base font-semibold">Submission successful</p>
          <p className="mt-1 text-sm">Received {submittedAt}. You can update the links until the deadline.</p>
        </div>
      ) : null}
      <Field label="GitHub repository URL" htmlFor="githubUrl" error={errors.githubUrl} hint="https://github.com/team/project">
        <Input id="githubUrl" value={values.githubUrl} disabled={locked || pending} onChange={(event) => setValues({ ...values, githubUrl: event.target.value })} aria-invalid={Boolean(errors.githubUrl)} />
      </Field>
      <Field label="Demo video URL" htmlFor="demoUrl" error={errors.demoUrl} hint="Optional. Must start with https:// if provided.">
        <Input id="demoUrl" value={values.demoUrl} disabled={locked || pending} onChange={(event) => setValues({ ...values, demoUrl: event.target.value })} />
      </Field>
      <Field label="Documentation URL" htmlFor="docsUrl" error={errors.docsUrl} hint="Optional. Must start with https:// if provided.">
        <Input id="docsUrl" value={values.docsUrl} disabled={locked || pending} onChange={(event) => setValues({ ...values, docsUrl: event.target.value })} />
      </Field>
      <Field label="Additional notes" htmlFor="notes" error={errors.notes} count={`${values.notes.length}/1000`}>
        <Textarea id="notes" value={values.notes} maxLength={1000} disabled={locked || pending} onChange={(event) => setValues({ ...values, notes: event.target.value })} />
      </Field>
      <Button type="submit" disabled={locked || pending}>{pending ? "Submitting…" : submittedAt ? "Update submission" : "Submit repository"}</Button>
    </form>
  );
}
