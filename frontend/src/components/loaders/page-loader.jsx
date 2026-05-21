import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}