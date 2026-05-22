import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    label: "Active",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  inactive: {
    label: "Inactive",
    className:
      "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300",
  },
  invited: {
    label: "Invited",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
  },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || {
    label: status || "-",
    className: "",
  };

  return (
    <Badge
      variant="outline"
      className={cn("capitalize", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}