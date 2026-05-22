import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  description = "Unable to load data. Please try again.",
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {onRetry ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}