"use client";

import { useEffect, useState } from "react";

export function Countdown({ deadline, label }: { deadline: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (now == null) return <div className="h-24 animate-pulse bg-secondary" aria-hidden="true" />;

  const diff = new Date(deadline).getTime() - now;
  if (diff <= 0) {
    return (
      <div>
        <p className="kicker">{label}</p>
        <p className="mt-2 font-display text-3xl">Deadline passed</p>
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
      <p className="kicker">{label}</p>
      <dl className="mt-3 grid grid-cols-4 gap-px overflow-hidden border border-border bg-border">
        {parts.map(([name, value]) => (
          <div key={name} className="bg-card px-2 py-3 text-center">
            <dt className="kicker">{name}</dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{String(value).padStart(2, "0")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
