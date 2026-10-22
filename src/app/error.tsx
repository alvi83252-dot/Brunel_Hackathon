"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">{error.message || "The page could not be loaded."}</p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
