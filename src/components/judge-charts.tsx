"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function JudgeCharts({
  tracks,
  funnel,
}: {
  tracks: Array<{ track: string; average: number; teams: number }>;
  funnel: Array<{ stage: string; count: number }>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Average score by track" empty={tracks.every((item) => item.average === 0)}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tracks}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="track" interval={0} angle={-20} textAnchor="end" height={70} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip />
            <Bar dataKey="average" name="Average" fill="var(--foreground)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Submission progress" empty={funnel.every((item) => item.count === 0)}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={funnel}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip />
            <Bar dataKey="count" name="Teams" fill="var(--muted-foreground)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {empty ? <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Nothing to chart yet.</p> : children}
    </section>
  );
}
