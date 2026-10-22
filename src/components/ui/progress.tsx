"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <ProgressPrimitive.Root
      value={value}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <ProgressPrimitive.Indicator className="h-full bg-accent transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </ProgressPrimitive.Root>
  );
}
