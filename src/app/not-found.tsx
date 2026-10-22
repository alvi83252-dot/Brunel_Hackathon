import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">That address is not part of the hackathon portal.</p>
      <Button asChild>
        <Link href="/">Back to the start</Link>
      </Button>
    </main>
  );
}
