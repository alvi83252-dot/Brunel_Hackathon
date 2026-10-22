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
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="track" interval={0} angle={-20} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="average" name="Average" fill="#F37021" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Submission progress" empty={funnel.every((item) => item.count === 0)}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={funnel}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Teams" fill="#07294D" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {empty ? <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Nothing to chart yet.</p> : children}
    </section>
  );
}
