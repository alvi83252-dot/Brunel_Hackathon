import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-sm border border-transparent px-1.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      accent: "bg-accent text-accent-foreground",
      muted: "bg-secondary text-secondary-foreground",
      success: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
      warning: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
    },
  },
  defaultVariants: { variant: "muted" },
});

export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
