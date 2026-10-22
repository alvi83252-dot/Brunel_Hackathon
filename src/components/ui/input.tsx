import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex min-h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
