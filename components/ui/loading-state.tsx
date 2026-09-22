import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-lg bg-muted", className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2 className="h-4 w-4 animate-spin text-accent" />
      {label && <span>{label}</span>}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-2 h-6 w-32" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export { Skeleton, Spinner, CardSkeleton };
