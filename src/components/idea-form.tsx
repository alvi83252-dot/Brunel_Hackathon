"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Field, readJson } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type IdeaValues = {
  trackId: string;
  title: string;
  shortDescription: string;
  problemStatement: string;
  proposedSolution: string;
  expectedImpact: string;
};

export function IdeaForm({
  locked,
  projectId,
  tracks,
  initial,
}: {
  locked: boolean;
  projectId?: string;
  tracks: Array<{ id: string; name: string; summary: string }>;
  initial: IdeaValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function set<K extends keyof IdeaValues>(key: K, value: IdeaValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (locked) return;
    setPending(true);
    setErrors({});
    const response = await fetch(projectId ? `/api/projects/${projectId}` : "/api/projects", {
      method: projectId ? "PATCH" : "POST",
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
    toast.success("Idea saved. A confirmation email has been recorded.");
    router.push("/participant");
    router.refresh();
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold">Track</legend>
        <div className="divide-y divide-border border-y border-border">
          {tracks.map((track) => (
            <label key={track.id} className={`flex cursor-pointer gap-3 py-3 ${values.trackId === track.id ? "text-foreground" : "text-muted-foreground"}`}>
              <input className="mt-1 accent-[#07294D]" type="radio" name="trackId" value={track.id} checked={values.trackId === track.id} disabled={locked || pending} onChange={() => set("trackId", track.id)} />
              <span>
                <span className="block text-sm font-semibold text-foreground">{track.name}</span>
                <span className="mt-0.5 block text-sm leading-6">{track.summary}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.trackId ? <p className="text-sm text-destructive" role="alert">{errors.trackId}</p> : null}
      </fieldset>
      <Field label="Project title" htmlFor="title" error={errors.title} count={`${values.title.length}/100`}>
        <Input id="title" value={values.title} maxLength={100} disabled={locked || pending} onChange={(event) => set("title", event.target.value)} aria-invalid={Boolean(errors.title)} />
      </Field>
      <Field label="Short description" htmlFor="shortDescription" error={errors.shortDescription} count={`${values.shortDescription.length}/300`}>
        <Textarea id="shortDescription" value={values.shortDescription} maxLength={300} disabled={locked || pending} onChange={(event) => set("shortDescription", event.target.value)} aria-invalid={Boolean(errors.shortDescription)} />
      </Field>
      <Field label="Problem statement" htmlFor="problemStatement" error={errors.problemStatement} count={`${values.problemStatement.length}/1000`}>
        <Textarea id="problemStatement" value={values.problemStatement} maxLength={1000} disabled={locked || pending} onChange={(event) => set("problemStatement", event.target.value)} />
      </Field>
      <Field label="Proposed solution" htmlFor="proposedSolution" error={errors.proposedSolution} count={`${values.proposedSolution.length}/1000`}>
        <Textarea id="proposedSolution" value={values.proposedSolution} maxLength={1000} disabled={locked || pending} onChange={(event) => set("proposedSolution", event.target.value)} />
      </Field>
      <Field label="Expected impact" htmlFor="expectedImpact" error={errors.expectedImpact} count={`${values.expectedImpact.length}/1000`}>
        <Textarea id="expectedImpact" value={values.expectedImpact} maxLength={1000} disabled={locked || pending} onChange={(event) => set("expectedImpact", event.target.value)} />
      </Field>
      <Button type="submit" disabled={locked || pending}>{pending ? "Saving…" : projectId ? "Update idea" : "Submit idea"}</Button>
    </form>
  );
}
