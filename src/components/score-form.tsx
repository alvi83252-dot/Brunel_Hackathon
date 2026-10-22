"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Field, readJson } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { CRITERIA, RECOMMENDATIONS, weightedScore, type CriterionKey, type RecommendationValue } from "@/lib/scoring";
import { formatWhen } from "@/lib/utils";

export type ReviewDraft = {
  technical: number | null;
  innovation: number | null;
  impact: number | null;
  solution: number | null;
  sponsor: number | null;
  business: number | null;
  presentation: number | null;
  technicalNote: string;
  innovationNote: string;
  impactNote: string;
  solutionNote: string;
  sponsorNote: string;
  businessNote: string;
  presentationNote: string;
  overallFeedback: string;
  recommendation: RecommendationValue | null;
  status: "DRAFT" | "SUBMITTED";
  weightedScore: number | null;
  updatedAt?: string;
};

const emptyDraft: ReviewDraft = {
  technical: null,
  innovation: null,
  impact: null,
  solution: null,
  sponsor: null,
  business: null,
  presentation: null,
  technicalNote: "",
  innovationNote: "",
  impactNote: "",
  solutionNote: "",
  sponsorNote: "",
  businessNote: "",
  presentationNote: "",
  overallFeedback: "",
  recommendation: null,
  status: "DRAFT",
  weightedScore: null,
};

export function ScoreForm({ projectId, open, initial }: { projectId: string; open: boolean; initial: ReviewDraft | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ReviewDraft>(initial ?? emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const draftRef = useRef(draft);
  const savedSnapshot = useRef<string | null>(null);
  draftRef.current = draft;

  useEffect(() => {
    const snapshot = JSON.stringify({ ...draft, updatedAt: undefined });
    if (savedSnapshot.current == null) {
      savedSnapshot.current = snapshot;
      return;
    }
    if (!open || snapshot === savedSnapshot.current) return;
    const timer = window.setTimeout(() => {
      const status = draftRef.current.status === "SUBMITTED" ? "SUBMITTED" : "DRAFT";
      void persist(status, false).then((ok) => {
        if (ok) savedSnapshot.current = snapshot;
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [draft, open]);

  async function persist(status: "DRAFT" | "SUBMITTED", announce: boolean) {
    setSaveState("saving");
    const current = draftRef.current;
    const response = await fetch("/api/scores", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, projectId, status }),
    });
    const result = await readJson(response);
    if (!response.ok) {
      setErrors(result.fieldErrors);
      setSaveState("error");
      if (announce) toast.error(result.error);
      return false;
    }
    setErrors({});
    if (status === "SUBMITTED") {
      setDraft((value) => ({ ...value, status: "SUBMITTED", updatedAt: new Date().toISOString() }));
    }
    setSaveState("saved");
    if (status === "SUBMITTED") router.refresh();
    if (announce) toast.success(status === "SUBMITTED" ? "Score submitted." : "Draft saved.");
    return true;
  }

  function setScore(key: CriterionKey, value: string) {
    setDraft((current) => ({ ...current, [key]: value ? Number(value) : null }));
  }

  function setNote(key: `${CriterionKey}Note`, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const live = weightedScore(draft);
  const scoredCriteria = CRITERIA.filter((criterion) => draft[criterion.key] != null).length;
  const criteriaPercent = Math.round((scoredCriteria / CRITERIA.length) * 100);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setPendingSubmit(true);
        void persist("SUBMITTED", true).finally(() => setPendingSubmit(false));
      }}
    >
      <div className="rounded-2xl bg-[#07294D] p-4 text-white">
        <p className="text-sm text-white/75">Weighted score</p>
        <p className="text-4xl font-bold tabular-nums">{live == null ? "—" : live.toFixed(2)}</p>
        <p className="text-sm text-white/75">Out of 100. Each score is 1–10, multiplied by its weight, then scaled.</p>
        <div className="mt-4 grid gap-2">
          <p className="text-sm text-white/75">{scoredCriteria} of {CRITERIA.length} criteria scored</p>
          <Progress value={criteriaPercent} label={`${scoredCriteria} of ${CRITERIA.length} criteria scored`} className="bg-white/20" />
        </div>
      </div>
      {CRITERIA.map((criterion) => (
        <fieldset key={criterion.key} className="grid gap-2 rounded-2xl border border-border p-3">
          <legend className="px-1 text-sm font-bold">
            {criterion.label} <span className="font-semibold text-muted-foreground">{Math.round(criterion.weight * 100)}%</span>
          </legend>
          <p className="text-sm text-muted-foreground">{criterion.description}</p>
          <Field label="Score" htmlFor={`${criterion.key}-score`} error={errors[criterion.key]}>
            <select
              id={`${criterion.key}-score`}
              className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base"
              value={draft[criterion.key] ?? ""}
              disabled={!open || pendingSubmit}
              onChange={(event) => setScore(criterion.key, event.target.value)}
            >
              <option value="">Choose 1–10</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
                <option key={score} value={score}>
                  {score}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Judge comments" htmlFor={`${criterion.key}-note`} error={errors[`${criterion.key}Note`]}>
            <Textarea
              id={`${criterion.key}-note`}
              value={draft[`${criterion.key}Note`]}
              disabled={!open || pendingSubmit}
              onChange={(event) => setNote(`${criterion.key}Note`, event.target.value)}
            />
          </Field>
        </fieldset>
      ))}
      <Field label="Overall feedback" htmlFor="overallFeedback" error={errors.overallFeedback}>
        <Textarea id="overallFeedback" value={draft.overallFeedback} disabled={!open || pendingSubmit} onChange={(event) => setDraft({ ...draft, overallFeedback: event.target.value })} />
      </Field>
      <Field label="Recommendation" htmlFor="recommendation" error={errors.recommendation}>
        <select
          id="recommendation"
          className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base"
          value={draft.recommendation ?? ""}
          disabled={!open || pendingSubmit}
          onChange={(event) => setDraft({ ...draft, recommendation: (event.target.value || null) as RecommendationValue | null })}
        >
          <option value="">Choose a recommendation</option>
          {RECOMMENDATIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!open || pendingSubmit}>
          {pendingSubmit ? "Submitting…" : draft.status === "SUBMITTED" ? "Update submitted score" : "Submit score"}
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? `Saved ${draft.updatedAt ? formatWhen(draft.updatedAt) : "just now"}` : saveState === "error" ? "Could not save the latest change." : "Drafts save automatically."}
        </p>
      </div>
      {!open ? <p className="text-sm text-destructive">Judging is closed. Scores can no longer be edited.</p> : null}
    </form>
  );
}
