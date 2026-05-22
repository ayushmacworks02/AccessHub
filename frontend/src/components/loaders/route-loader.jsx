import { Loader2 } from "lucide-react";

export function RouteLoader({ label = "Loading page..." }) {
  return (
    <div className="flex min-h-[50svh] items-center justify-center p-6">
      <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <Loader2 className="size-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}