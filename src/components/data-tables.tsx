"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TRACKS } from "@/lib/awards";

export type LeaderboardRow = {
  projectId: string;
  rank: number;
  trackRank: number;
  team: string;
  track: string;
  trackSlug: string;
  averageScore: number | null;
  judgeCount: number;
  submissionStatus: string;
};

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const [track, setTrack] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const filtered = track === "all" ? rows : rows.filter((row) => row.trackSlug === track);
  const columns = useMemo<ColumnDef<LeaderboardRow>[]>(
    () => [
      {
        id: "rank",
        header: "Rank",
        accessorFn: (row) => (track === "all" ? row.rank : row.trackRank),
        cell: ({ getValue }) => {
          const rank = Number(getValue());
          return rank > 0 ? rank : "—";
        },
      },
      { accessorKey: "team", header: "Team" },
      { accessorKey: "track", header: "Track" },
      {
        accessorKey: "averageScore",
        header: "Average score",
        cell: ({ getValue }) => {
          const value = getValue<number | null>();
          return value == null ? "—" : value.toFixed(2);
        },
      },
      { accessorKey: "judgeCount", header: "Judges" },
      {
        accessorKey: "submissionStatus",
        header: "Submission",
        cell: ({ getValue }) => <Badge variant={getValue() === "Final submitted" ? "success" : "warning"}>{String(getValue())}</Badge>,
      },
    ],
    [track],
  );
  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Track leaderboards">
        <TrackButton active={track === "all"} onClick={() => setTrack("all")}>
          Overall
        </TrackButton>
        {TRACKS.map((item) => (
          <TrackButton key={item.slug} active={track === item.slug} onClick={() => setTrack(item.slug)}>
            {item.name}
          </TrackButton>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="px-3 py-3 font-semibold">
                    <button type="button" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No projects in this view yet.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type ProjectRow = {
  id: string;
  team: string;
  track: string;
  title: string;
  submissionStatus: string;
  averageScore: number | null;
  judgeCount: number;
  myStatus: string;
  myScore: number | null;
};

export function ProjectTable({ rows }: { rows: ProjectRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<ProjectRow>[]>(
    () => [
      { accessorKey: "team", header: "Team" },
      { accessorKey: "track", header: "Track" },
      { accessorKey: "title", header: "Project" },
      {
        accessorKey: "submissionStatus",
        header: "Submission",
        cell: ({ getValue }) => <Badge variant={getValue() === "Final submitted" ? "success" : "warning"}>{String(getValue())}</Badge>,
      },
      {
        accessorKey: "myStatus",
        header: "Your score",
        cell: ({ row }) => (row.original.myStatus === "SUBMITTED" && row.original.myScore != null ? row.original.myScore.toFixed(2) : row.original.myStatus === "DRAFT" ? "Draft" : "Not scored"),
      },
      {
        accessorKey: "averageScore",
        header: "Average",
        cell: ({ row }) => (row.original.averageScore == null ? "—" : `${row.original.averageScore.toFixed(2)} (${row.original.judgeCount})`),
      },
      {
        id: "review",
        header: "Review",
        cell: ({ row }) => (
          <Link className="font-semibold underline" href={`/judge/projects/${row.original.id}`}>
            Open
          </Link>
        ),
      },
    ],
    [],
  );
  const table = useReactTable({ data: rows, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  if (rows.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No ideas have been submitted yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead className="bg-secondary">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="px-3 py-3 font-semibold">
                  <button type="button" onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </button>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrackButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
    >
      {children}
    </button>
  );
}
