"use client";

import { useEffect, useState } from "react";

export function Countdown({ deadline, label }: { deadline: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (now == null) return <div className="h-20 animate-pulse rounded-2xl bg-secondary" aria-hidden="true" />;

  const diff = new Date(deadline).getTime() - now;
  if (diff <= 0) {
    return (
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">Deadline passed</p>
      </div>
    );
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  const parts = [
    ["Days", days],
    ["Hours", hours],
    ["Minutes", minutes],
    ["Seconds", seconds],
  ] as const;

  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <dl className="mt-3 grid grid-cols-4 gap-2">
        {parts.map(([name, value]) => (
          <div key={name} className="rounded-xl bg-secondary px-2 py-2 text-center">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{name}</dt>
            <dd className="text-xl font-bold tabular-nums">{String(value).padStart(2, "0")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
