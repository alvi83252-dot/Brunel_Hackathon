"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BlindToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next);
    setPending(true);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blindJudging: next }),
    });
    if (!response.ok) {
      setOn(!next);
      toast.error("Could not update blind judging.");
    } else {
      toast.success(next ? "Blind judging is on." : "Blind judging is off.");
      router.refresh();
    }
    setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <p className="text-lg font-bold">Blind judging {on ? "on" : "off"}</p>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          When this is on, team names, student names, student IDs, and emails are replaced with Team #001, Team #002, and so on.
        </p>
      </div>
      <Button type="button" aria-pressed={on} disabled={pending} onClick={toggle}>
        {pending ? "Saving…" : on ? "Turn off" : "Turn on"}
      </Button>
    </div>
  );
}
