import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  );
}
