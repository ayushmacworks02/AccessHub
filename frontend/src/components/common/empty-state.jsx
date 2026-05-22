import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "No data found",
  description = "There are no records to display right now.",
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}