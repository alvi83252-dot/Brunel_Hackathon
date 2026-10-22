import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  count,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-end justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {count ? <span className="text-xs text-muted-foreground">{count}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export async function readJson(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { error?: string; fieldErrors?: Record<string, string> | null };
  return { ok: response.ok, error: data.error ?? "Something went wrong. Try again.", fieldErrors: data.fieldErrors ?? {} };
}
