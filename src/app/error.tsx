"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  void error;
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">The page could not be loaded. Try again, or return to the home page if this keeps happening.</p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
