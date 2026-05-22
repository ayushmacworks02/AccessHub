import {
  ArrowDownAZ,
  ArrowDownZA,
  Eye,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { formatDateTime } from "@/lib/utils/format-date";
import { useAuditsStore } from "@/features/audits/store/audits.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const columns = [
  {
    key: "action",
    label: "Action",
    sortable: true,
  },
  {
    key: "resource",
    label: "Resource",
    sortable: true,
  },
  {
    key: "actor",
    label: "Actor",
    sortable: false,
  },
  {
    key: "createdAt",
    label: "Time",
    sortable: true,
  },
];

const humanizeText = (value) => {
  if (!value) {
    return "-";
  }

  return String(value).replaceAll("_", " ").replaceAll("-", " ");
};

const getActorLabel = (audit) => {
  if (audit?.actor?.name) {
    return audit.actor.name;
  }

  if (audit?.actor?.email) {
    return audit.actor.email;
  }

  if (audit?.actorName) {
    return audit.actorName;
  }

  if (audit?.actorEmail) {
    return audit.actorEmail;
  }

  return "System";
};

export function AuditsTable({ audits = [] }) {
  const sortBy = useAuditsStore((state) => state.sortBy);
  const sortOrder = useAuditsStore((state) => state.sortOrder);
  const setSorting = useAuditsStore((state) => state.setSorting);
  const openDetailDialog = useAuditsStore((state) => state.openDetailDialog);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSorting({
        sortBy: columnKey,
        sortOrder: sortOrder === "asc" ? "desc" : "asc",
      });
      return;
    }

    setSorting({
      sortBy: columnKey,
      sortOrder: "asc",
    });
  };

  if (!audits.length) {
    return (
      <EmptyState
        title="No audit logs found"
        description="Audit events will appear here when users perform important actions."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      {sortBy === column.key ? (
                        sortOrder === "asc" ? (
                          <ArrowDownAZ className="size-3.5" />
                        ) : (
                          <ArrowDownZA className="size-3.5" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}

              <th className="w-16 px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {audits.map((audit) => (
              <tr key={audit._id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Badge variant="outline" className="rounded-lg capitalize">
                    {humanizeText(audit.action)}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">
                        {humanizeText(audit.resource)}
                      </p>

                      {audit.resourceId ? (
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {audit.resourceId}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium">{getActorLabel(audit)}</p>
                  {audit.ipAddress ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {audit.ipAddress}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(audit.createdAt)}
                </td>

                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openDetailDialog(audit)}>
                        <Eye className="size-4" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}